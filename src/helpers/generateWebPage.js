import htmlfile from "raw-loader!./generate.html";

const generateWebPage = (title, fileName, fileType) => {
  return new File([html(title, fileName, fileType)], "index.html", {
    type: "text/html",
  });
};

export default generateWebPage;

const html = (title, fileName, fileType) => {
  return htmlfile
    .replaceAll("${title}", title)
    .replaceAll("${fileName}", fileName)
    .replaceAll("${fileType}", fileType);
};
