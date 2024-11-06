const commentRoutes = require("../utils/route");
const commentController = require("../controller/commentController");
const roleMiddleware = require("../middleware/roleMiddleware");


commentRoutes.get("/comments", commentController.getComments);
commentRoutes.get("/comments/:id", commentController.getCommentById);
commentRoutes.post("/comments",roleMiddleware(['USER', 'ADMIN']), commentController.createComment);
commentRoutes.put("/comments/:id",roleMiddleware(['USER', 'ADMIN']), commentController.updateComment);
commentRoutes.delete("/comments/:id",roleMiddleware(['USER', 'ADMIN']), commentController.deleteComment);


module.exports = commentRoutes;
