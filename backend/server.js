const app = require("./app");
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Shnoor Job Portal API running on port ${PORT}`);
});
