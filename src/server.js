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
const uri = `mongodb+srv://only_me:112022@cluster0.efpjwcu.mongodb.net/?retryWrites=true&w=majority`;
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
        app.get("/products", async (req, res) => {
            const query = {};
            const cursor = products.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
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







        // app.get("/relativeProducts/:id", async (req, res) => {
        //     const id = req.params.id;
        //     // console.log("requested Id", id);
        //     // const allData = await products.find({});
        //     // const query = { _id: new ObjectId(id) };
        //     // const result = await products.findOne(query);
        //     // res.send(result);
        //     // res.send(allData);
        //     // console.log(allData);
        //     const query = { _id: id };
        //     const cursor = products.find(query);
        //     const result = await cursor.toArray();
        //     res.send(result);

        // });
        // update specific data
        app.put("/updateBlog/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const blog = req.body;
            const option = { upsert: true };
            const updatedBlog = {
                $set: {
                    title: blog.title,
                    tags: blog.tags,
                    blogText: blog.blogText,
                },
            };
            const result = await addBlogCollections.updateOne(
                filter,
                updatedBlog,
                option
            );
            res.send(result);
        });
        // delete blog data
        app.delete("/deleteBlog/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await addBlogCollections.deleteOne(query);
            res.send(result);
        });
        //create publish blog
        app.post("/publishBlog/", async (req, res) => {
            const user = req.body;
            const result = await publishedBlogsCollections.insertOne(user);
            res.send(result);
            // console.log(result);
        });
        // get publish blog
        app.get("/publishBlog", async (req, res) => {
            const query = {};
            const cursor = await publishedBlogsCollections.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
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