export const downloadFileFromResponse = (response, fallbackFilename) => {
  const disposition = response.headers?.["content-disposition"];
  let filename = fallbackFilename;
  if (disposition) {
    const match = disposition.match(/filename="?([^"]+)"?/);
    if (match && match[1]) {
      filename = match[1];
    }
  }
  const blob = new Blob([response.data], {
    type:
      response.headers?.["content-type"] ||
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
