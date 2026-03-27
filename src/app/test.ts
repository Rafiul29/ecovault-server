import { prisma } from "./lib/prisma";

(async () => {
  try {
    // Find all users with their posts
    const users = await prisma.user.findMany({
      include: { posts: true },
    });
    console.log("All users:", users);

    // Create a user with a post
    const user = await prisma.user.create({
      data: {
        email: "alice1@prisma.io",
        name: "Alice",
        posts: {
          create: { title: "Hello World" },
        },
      },
    });
    console.log("Created user:", user);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
})();