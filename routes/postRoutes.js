const categoryrouter = require("../utils/route");
const {postController,upload} = require("../controller/postController");
const roleMiddleware = require("../middleware/roleMiddleware");


categoryrouter.get("/posts", postController.getPosts);
categoryrouter.get("/postsid/:id", postController.getPostById);
categoryrouter.post("/posts",roleMiddleware(['USER', 'ADMIN']),upload.single("file"), postController.createPost);
categoryrouter.put("/posts/:id",roleMiddleware(['USER', 'ADMIN']), upload.single("file"), postController.updatePost);
categoryrouter.delete("/posts/:id",roleMiddleware(['USER', 'ADMIN']), postController.deletePost);

categoryrouter.get(
  "/posts/user",
  roleMiddleware(["USER", "ADMIN"]),
  postController.getUserPosts
);




module.exports = categoryrouter;
