const express = require("express");
const cors = require("cors");
const app = express();
// require("dotenv").config();
// middleware
app.use(cors());
app.use(express.json());
// port
const port = process.env.PORT || 5000;
app.get("/", (req, res) => {
    res.send("I am running on the home of the Server.");
});

const {
    MongoClient,
    ServerApiVersion,
    ObjectId,
    CURSOR_FLAGS,
} = require("mongodb");
// const uri = `mongodb+srv://only_me:112022@cluster0.efpjwcu.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb://only_me:112022@ac-dcujods-shard-00-00.efpjwcu.mongodb.net:27017,ac-dcujods-shard-00-01.efpjwcu.mongodb.net:27017,ac-dcujods-shard-00-02.efpjwcu.mongodb.net:27017/?ssl=true&replicaSet=atlas-5aa5iy-shard-0&authSource=admin&retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});
console.log(client, "Database connected");

async function run() {
    try {
        const featuredProducts = client
            .db("GroceryMania")
            .collection("FeaturedProducts");
        const products = client
            .db("GroceryMania")
            .collection("Products");
        const visuals = client
            .db("GroceryMania")
            .collection("Visuals");
        const users = client
            .db("GroceryMania")
            .collection("Users");
        const bookedOrder = client
            .db("GroceryMania")
            .collection("BookedOrder");
        const cartOrder = client
            .db("GroceryMania")
            .collection("OrderOnCart");
        const comments = client
            .db("GroceryMania")
            .collection("Comments");
        // root app
        app.get("/", async (req, res) => {
            res.send("Server is running");
        });

        // get featuredProducts data
        app.get("/featuredProducts", async (req, res) => {
            const query = {};
            const cursor = featuredProducts.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get("/visuals", async (req, res) => {
            const query = {};
            const cursor = visuals.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        // app.get("/products", async (req, res) => {
        //     const query = {};
        //     const cursor = products.find(query);
        //     const result = await cursor.toArray();
        //     res.send(result);
        // });
        // get specific data
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            console.log("requested Id", id);
            const query = { _id: new ObjectId(id) };
            const result = await products.findOne(query);
            res.send(result);
        });

        app.get("/users", async (req, res) => {
            const query = {};
            const cursor = users.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        app.get("/users/:email", async (req, res) => {
            const { email } = req.params;
            const query = { email };
            const cursor = users.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        //create users 
        app.post("/users", async (req, res) => {
            const user = req.body;
            const result = await users.insertOne(user);
            res.send(result);
            // console.log(result);
        });
        //book order  
        app.post("/orders", async (req, res) => {
            const order = req.body;
            const result = await bookedOrder.insertOne(order);
            res.send(result);
            // console.log(result);
        });
        //cart order  
        app.post("/cart", async (req, res) => {
            const order = req.body;
            const result = await cartOrder.insertOne(order);
            res.send(result);
            // console.log(result);
        });
        // get book order
        app.get("/orders", async (req, res) => {
            const query = {};
            const cursor = bookedOrder.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        // get cart order
        app.get("/cart", async (req, res) => {
            const query = {};
            const cursor = cartOrder.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // delete a user
        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await users.deleteOne(query);
            res.send(result);
        });
        // delete a product
        app.delete("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await products.deleteOne(query);
            res.send(result);
        });

        // update profile data
        app.patch("/edit-profile/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const profileData = req.body;
            const option = { upsert: true };
            const updatedProfileData = {
                $set: {
                    name: profileData?.name,
                    email: profileData?.email,
                    role: profileData?.role,
                    phoneNumber: profileData?.phoneNumber,
                },
            };
            const result = await users.updateOne(
                filter,
                updatedProfileData,
                option
            );
            res.send(result);
        });

        // query products data
        // app.get("/products", async (req, res) => {
        //     // const searchQuery = req.query;
        //     const sort = req.query.sort;
        //     const search = req.query.search;
        //     const category = req.query.category;
        //     // console.log(search);
        //     const options = {
        //         sort: {
        //             "price": sort === 'asc' ? 1 : -1
        //         }
        //     };
        //     const query = {};

        //     if (search) {
        //         query.name = { $regex: search, $options: 'i' };
        //     }

        //     if (category) {
        //         query.category = category;
        //     }


        //     const cursor = products.find(query, options);
        //     // const cursor = products.find({ });
        //     const result = await cursor.toArray();
        //     res.send(result);
        // });
        app.get("/products", async (req, res) => {
            const sort = req.query.sort;
            const search = req.query.search;
            const category = req.query.category;
            const status = req.query.status;
            const minPrice = parseFloat(req.query.minPrice); // Parse minPrice to a number
            const maxPrice = parseFloat(req.query.maxPrice); // Parse maxPrice to a number
            const page = parseInt(req.query.page) || 1; // Current page
            const limit = parseInt(req.query.limit) || 6; // Items per page
            const skip = (page - 1) * limit;
            const totalProducts = await products.countDocuments();
            const options = {
                sort: {
                    "price": sort === 'asc' ? 1 : -1
                }
            };

            const query = {};
            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }
            if (category) {
                query.category = category;
            }
            if (status) {
                query.status = status;
            }
            if (!isNaN(minPrice) && !isNaN(maxPrice)) {
                query.price = { $gte: minPrice, $lte: maxPrice };
            } else if (!isNaN(minPrice)) {
                query.price = { $gte: minPrice };
            } else if (!isNaN(maxPrice)) {
                query.price = { $lte: maxPrice };
            }
            // const cursor = products.find(query, options);
            // const result = await cursor.toArray();
            const paginatedProducts = await products.find(query, options).skip(skip).limit(limit).toArray();
            res.send({
                paginatedProducts,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                totalProducts,
            });
        });
        app.post("/comment", async (req, res) => {
            const comment = req.body;
            const result = await comments.insertOne(comment);
            res.send(result);
            // console.log(result);
        });
        app.get("/comment", async (req, res) => {
            const query = {};
            const cursor = comments.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // Pagination
        // app.delete("/products/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const result = await products.deleteOne(query);
        //     res.send(result);
        // });


        // update specific data
        // app.put("/updateBlog/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const blog = req.body;
        //     const option = { upsert: true };
        //     const updatedBlog = {
        //         $set: {
        //             title: blog.title,
        //             tags: blog.tags,
        //             blogText: blog.blogText,
        //         },
        //     };
        //     const result = await addBlogCollections.updateOne(
        //         filter,
        //         updatedBlog,
        //         option
        //     );
        //     res.send(result);
        // });
        // // delete blog data
        // app.delete("/deleteBlog/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await addBlogCollections.deleteOne(query);
        //     res.send(result);
        // });
        // //create publish blog
        // app.post("/publishBlog/", async (req, res) => {
        //     const user = req.body;
        //     const result = await publishedBlogsCollections.insertOne(user);
        //     res.send(result);
        //     // console.log(result);
        // });
        // // get publish blog
        // app.get("/publishBlog", async (req, res) => {
        //     const query = {};
        //     const cursor = await publishedBlogsCollections.find(query);
        //     const result = await cursor.toArray();
        //     res.send(result);
        // });

        // unpublish blog
        // app.delete("/publishBlog/:id", async (req, res) => {
        //   const id = req.params.id;
        //   // console.log(id);
        //   const query = { _id: ObjectId(id) };
        //   console.log(query);
        //   const result = await publishedBlogsCollections.deleteOne(query);

        //   res.send(result);
        //   console.log(result);
        // });

    } finally {
    }
}
run().catch((err) => console.log(err));

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});