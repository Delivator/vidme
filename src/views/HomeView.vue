<template>
  <v-container fill-height fluid :class="{ dark: videoSelected }">
    <v-row justify="center" v-if="!videoSelected">
      <video
        src="background.webm"
        autoplay
        muted
        loop
        class="background-video"
        @canplay="backgroundSeek"
      ></video>
      <v-col cols="12">
        <h1 class="text-h3 font-weight-light text-center">
          Share videos, not your data.
        </h1>
      </v-col>
      <v-col align="center" cols="12">
        <v-btn
          color="primary"
          x-large
          @click="$refs.file.click()"
          :loading="uploading"
        >
          Upload a video
        </v-btn>
      </v-col>
    </v-row>
    <v-row justify="center" v-else>
      <v-col align="center" cols="12" sm="6" md="3">
        <v-text-field label="Title" v-model="videoTitle"></v-text-field>
      </v-col>
      <v-col align="center" cols="12">
        <video
          class="preview-video"
          controls
          :src="videoBlobUrl"
          @canplay="videoCanPlay"
        ></video>
      </v-col>
      <v-col align="center" cols="12" sm="10" md="8" xl="6" v-if="trimMode">
        <v-range-slider
          v-model="range"
          :max="max"
          step="0.1"
          hide-details
          class="align-center"
          @change="onRangeChange"
        >
          <template v-slot:prepend>
            <v-text-field
              :value="range[0]"
              min="0"
              :max="max - 0.1"
              step="0.1"
              class="mt-0 pt-0"
              hide-details
              single-line
              type="number"
              style="width: 100px"
              @change="onRangeStartChange"
            >
              <template v-slot:prepend>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on" @click="setTrimStart">schedule</v-icon>
                  </template>
                  Set Start
                </v-tooltip>
              </template>
            </v-text-field>
          </template>
          <template v-slot:append>
            <v-text-field
              :value="range[1]"
              min="0.1"
              :max="max"
              step="0.1"
              class="mt-0 pt-0"
              hide-details
              single-line
              type="number"
              style="width: 100px"
              @change="onRangeEndChange"
            >
              <template v-slot:append-outer>
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on" @click="setTrimEnd">schedule</v-icon>
                  </template>
                  Set End
                </v-tooltip>
              </template>
            </v-text-field>
          </template>
        </v-range-slider>
      </v-col>
      <v-col align="center" cols="12" v-if="!publishedLink">
        <v-btn
          dark
          outlined
          class="ma-3"
          large
          color="teal"
          @click="generateThumbnail"
          :loading="thumbnailLoading"
          :disabled="uploading"
          v-if="!trimMode"
        >
          Current frame as Thumbnail
        </v-btn>
        <v-btn
          dark
          outlined
          class="mr-6"
          large
          color="success"
          :disabled="trimLoading"
          @click="trimMode = false"
          v-if="trimMode"
        >
          Done Trimming
        </v-btn>
        <v-btn
          large
          outlined
          color="orange"
          class="ma-3"
          :loading="trimLoading"
          :disabled="uploading"
          @click="trimVideo"
        >
          Trim Video
          <v-icon right>content_cut</v-icon>
        </v-btn>
      </v-col>
      <v-col align="center" cols="12" v-if="!publishedLink && !trimMode">
        <v-btn
          color="primary"
          large
          outlined
          :loading="uploading"
          @click="publishVideo"
        >
          Publish
          <v-icon right>cloud_upload</v-icon>
        </v-btn>
      </v-col>
      <v-col align="center" cols="12" v-if="publishedLink">
        <h1>Share your video:</h1>
        <h2>
          <a :href="publishedLink" target="_blank">{{ publishedLink }}</a>
        </h2>
        <p class="subtext text-caption mt-4">
          Anyone with the link can access the video. Content can not be removed,
          only blocked by the portal. Videos uploaded to siasky.net will stay
          online for 90 days.
        </p>
        <v-btn @click="resetPage" color="green" large dark outlined>
          Upload new Video
        </v-btn>
      </v-col>
    </v-row>
    <input
      class="file-input"
      ref="file"
      type="file"
      accept="video/*"
      @change="processVideo"
    />
  </v-container>
</template>

<style scoped>
.file-input {
  display: none;
}

.background-video {
  position: fixed;
  top: 0;
  left: 0;
  min-height: 100%;
  min-width: 100%;
  pointer-events: none;
  z-index: -1;
}

.subtext {
  max-width: 460px;
}

.preview-video {
  max-height: 50vh;
  max-width: 80vw;
}

.dark {
  background: #121212;
}
</style>

<script>
import imageCompression from "browser-image-compression";
import generateWebPage from "../helpers/generateWebPage";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

const ffmpeg = createFFmpeg();

function stripFileExt(string) {
  let splitString = string.split(".");
  splitString.pop();
  return splitString.join(".");
}

export default {
  name: "HomeView",

  data() {
    return {
      videoFile: null,
      videoBlobUrl: "",
      videoTitle: "Untitled",
      videoSelected: false,
      uploading: false,
      thumbnail: null,
      publishedLink: "",
      backgroundSeeked: false,
      thumbnailLoading: false,
      trimMode: false,
      trimLoading: false,
      fileExt: "",

      max: 0,
      range: [0, 0],
      lastRange: [0, 0],
    };
  },

  computed: {
    client() {
      return this.$store.state.skynetClient;
    },
  },

  methods: {
    processVideo(event) {
      if (event.target.files?.length !== 1) return;

      const file = event.target.files[0];

      this.videoFile = file;
      this.videoBlobUrl = URL.createObjectURL(file);
      this.videoTitle = stripFileExt(file.name) ?? "Untitled";
      this.fileExt = file.name.split(".").at(-1);

      this.videoSelected = true;
    },

    videoCanPlay() {
      // generate first thumbnail
      if (!this.thumbnail) {
        setTimeout(() => {
          this.generateThumbnail();
          this.setRangeLimits();
        }, 500);
      }
    },

    async generateThumbnail(event) {
      if (event) {
        this.thumbnailLoading = true;
        setTimeout(() => {
          this.thumbnailLoading = false;
        }, 500);
      }
      const videoElement = document.querySelector("video");
      const canvas = document.createElement("canvas");
      const options = {
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      canvas
        .getContext("2d")
        .drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      try {
        let file = await imageCompression.canvasToFile(canvas, "image/jpeg");
        let blob = await imageCompression(file, options);
        this.thumbnail = blob;
      } catch (error) {
        console.error(error);
      }
      canvas.remove();
    },

    async publishVideo() {
      const directory = {
        "index.html": generateWebPage(
          this.videoTitle,
          this.videoFile.name ?? "video.mp4",
          this.videoFile.type
        ),
        [this.videoFile.name]: this.videoFile,
        "thumbnail.jpg": this.thumbnail,
      };

      try {
        this.uploading = true;
        const { skylink } = await this.client.uploadDirectory(
          directory,
          "vidme " + this.videoTitle
        );
        this.uploading = false;
        // this.publishedLink = await this.client.getSkylinkUrl(skylink, {
        //   subdomain: true,
        // });
        this.publishedLink = await this.client.getSkylinkUrl(skylink);
      } catch (error) {
        this.uploading = false;
        console.error(error);
      }
    },

    backgroundSeek(event) {
      if (this.backgroundSeeked) return;
      const videoElement = event.target;
      const newTime = Math.floor(Math.random() * videoElement.duration);
      videoElement.currentTime = newTime;
      this.backgroundSeeked = true;
    },

    resetPage() {
      this.videoSelected = false;
      this.publishedLink = "";
      this.thumbnail = null;
      this.$refs.file.value = "";
    },

    setRangeLimits() {
      const videoElement = document.querySelector(".preview-video");
      this.max = videoElement.duration;
      this.range = [0, videoElement.duration];
    },

    async trimVideo() {
      if (!this.trimMode) {
        this.trimMode = true;
        return;
      }
      this.trimLoading = true;
      if (!ffmpeg.isLoaded()) await ffmpeg.load();
      const inFile = `input.${this.fileExt}`;
      const outFile = `output.${this.fileExt}`;
      ffmpeg.FS("writeFile", inFile, await fetchFile(this.videoFile));
      await ffmpeg.run(
        "-ss",
        this.range[0].toString(),
        "-i",
        inFile,
        "-t",
        (this.range[1] - this.range[0]).toString(),
        "-c",
        "copy",
        "-avoid_negative_ts",
        "1",
        outFile
      );
      const data = ffmpeg.FS("readFile", outFile);
      const newFile = new File([data.buffer], this.videoFile.name, {
        type: this.videoFile.type,
        lastModified: this.videoFile.lastModified,
      });
      this.videoFile = newFile;
      this.videoBlobUrl = URL.createObjectURL(newFile);
      this.trimLoading = false;
      setTimeout(() => {
        this.generateThumbnail();
        this.setRangeLimits();
      }, 500);
    },

    setTrimStart() {
      const currentTime = document.querySelector(".preview-video").currentTime;
      this.$set(this.range, 0, currentTime);
    },

    setTrimEnd() {
      const currentTime = document.querySelector(".preview-video").currentTime;
      this.$set(this.range, 1, currentTime);
    },

    setCurrentTime(value) {
      document.querySelector(".preview-video").currentTime = value;
    },

    onRangeChange(value) {
      if (value[0] !== this.lastRange[0]) this.setCurrentTime(value[0]);
      if (value[1] !== this.lastRange[1]) this.setCurrentTime(value[1]);
      this.lastRange = value;
    },

    onRangeStartChange(value) {
      this.$set(this.range, 0, value);
      this.setCurrentTime(value);
    },

    onRangeEndChange(value) {
      this.$set(this.range, 1, value);
      this.setCurrentTime(value);
    },
  },
};
</script>
