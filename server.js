require('dotenv').config();
// console.log(process.env.MONGO_URL);
// mongoose.connect(process.env.MONGO_URL);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();

/* ================= MIDDLEWARES ================= */

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

/* ================= MONGODB ================= */

mongoose.connect(process.env.MONGO_URL)

.then(() => console.log("Database connected successfully!"))

.catch(err => console.error("Database connection error:", err));

/* ================= MULTER IMAGE UPLOAD ================= */

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, 'uploads/');

    },

    filename: function (req, file, cb) {

        cb(

            null,

            Date.now() + path.extname(file.originalname)

        );

    }

});

const upload = multer({ storage: storage });

/* ================= IMAGE UPLOAD API ================= */

app.post('/api/upload', upload.single('image'), (req, res) => {

    try {

        res.status(200).json({

            success: true,

            imageUrl: `http://localhost:3000/uploads/${req.file.filename}`

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

/* ================= SCHEMAS ================= */

const ContactSchema = new mongoose.Schema({

    name: String,

    phone: String,

    message: String

});

const Contact = mongoose.model('Contact', ContactSchema);

const OrderSchema = new mongoose.Schema({

    orderId: String,

    userId: String,

    userName: String,

    userEmail: String,

    fullName: String,

    phone: String,

    address: String,

    city: String,

    pincode: String,

    items: Array,

    totalAmount: Number,

    status: {

        type: String,

        default: "Processing"

    },

    orderDate: {

        type: Date,

        default: Date.now

    }

});

const Order = mongoose.model('Order', OrderSchema);

const ProductSchema = new mongoose.Schema({

    id: Number,

    name: String,

    price: String,

    img: String,

    desc: String,

    category: String

});

const Product = mongoose.model('product', ProductSchema);

const ReviewSchema = new mongoose.Schema({

    name: String,

    rating: Number,

    message: String,

    createdAt: {

        type: Date,

        default: Date.now

    }

});

const Review = mongoose.model('Review', ReviewSchema);

const ProductReviewSchema = new mongoose.Schema({

    productId: String,

    name: String,

    rating: Number,

    message: String,

    createdAt: {

        type: Date,

        default: Date.now

    }

});

const ProductReview = mongoose.model('ProductReview', ProductReviewSchema);

const UserSchema = new mongoose.Schema({

    name: String,

    email: {

        type: String,

        unique: true

    },

    phone: String,

    password: String

});

const User = mongoose.model('User', UserSchema);

/* ================= ROUTES ================= */

app.get('/', (req, res) => {

    res.send("Server is running perfectly!");

});

/* ================= PRODUCTS ================= */

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();

        console.log("Products found:", products.length);

        res.status(200).json(products);

    } catch (err) {

        console.error("PRODUCT ERROR:", err);

        res.status(500).json({
            error: err.message
        });
    }
});

app.get('/api/products/:id', async (req, res) => {

    try {

        const product = await Product.findOne({

            id: Number(req.params.id)

        });

        if (!product) {

            return res.status(404).json({

                message: "Product not found"

            });

        }

        res.json(product);

    } catch (err) {

        res.status(500).json({

            error: "Product fetch error"

        });

    }

});

/* ================= CONTACT ================= */

app.post('/api/contact', async (req, res) => {

    try {

        const newContact = new Contact(req.body);

        await newContact.save();

        res.status(200).json({

            success: true

        });

    } catch (err) {

        res.status(500).json({

            error: "Something went wrong"

        });

    }

});

/* ================= CHECKOUT ================= */

app.post('/api/checkout', async (req, res) => {

    try {

        const orderId = "ORD" + Date.now();

        const newOrder = new Order({

            ...req.body,

            orderId: orderId

        });

        await newOrder.save();

        res.status(200).json({

            success: true,

            orderId: orderId

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

/* ================= REVIEWS ================= */

app.get('/api/reviews', async (req, res) => {

    const reviews = await Review.find()

    .sort({ createdAt: -1 });

    res.json(reviews);

});

app.post('/api/reviews', async (req, res) => {

    const newReview = new Review(req.body);

    await newReview.save();

    res.status(200).json(newReview);

});

/* ================= PRODUCT REVIEWS ================= */

app.post('/api/product-reviews', async (req, res) => {

    const newReview = new ProductReview(req.body);

    await newReview.save();

    res.status(201).send(newReview);

});

app.get('/api/product-reviews/:productId', async (req, res) => {

    const reviews = await ProductReview.find({

        productId: req.params.productId

    });

    res.json(reviews);

});

/* ================= ADMIN LOGIN ================= */

app.post('/api/admin/login', (req, res) => {

    const { username, password } = req.body;

    if (

        username === "admin" &&

        password === "physio123"

    ) {

        res.status(200).json({

            success: true

        });

    } else {

        res.status(401).json({

            success: false

        });

    }

});

/* ================= DASHBOARD ================= */

app.get('/api/admin/dashboard-data', async (req, res) => {

    const products = await Product.find();

    const orders = await Order.find();

    res.json({

        products,

        orders

    });

});

/* ================= ADD PRODUCT ================= */

app.post('/api/admin/add-product', async (req, res) => {

    try {

        let {

            name,

            price,

            img,

            category,

            desc

        } = req.body;

        if (!price.includes('₹')) {

            price = `₹${price}`;

        }

        const lastProduct = await Product.findOne({

            category: category

        }).sort({ id: -1 });

        const newId = lastProduct

        ? Number(lastProduct.id) + 1

        : 1;

        const newProduct = new Product({

            id: newId,

            name,

            price,

            img,

            category,

            desc

        });

        await newProduct.save();

        res.status(201).json({

            success: true

        });

    } catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

/* ================= EDIT PRODUCT ================= */

app.put('/api/admin/product/:id', async (req, res) => {

    await Product.findByIdAndUpdate(

        req.params.id,

        req.body

    );

    res.json({

        success: true

    });

});

/* ================= DELETE PRODUCT ================= */

app.delete('/api/admin/product/:id', async (req, res) => {

    await Product.findByIdAndDelete(

        req.params.id

    );

    res.json({

        success: true

    });

});

/* ================= UPDATE ORDER ================= */

app.put('/api/admin/order/:id', async (req, res) => {

    await Order.findByIdAndUpdate(

        req.params.id,

        req.body

    );

    res.json({

        success: true

    });

});

/* ================= DELETE ORDER ================= */

app.delete('/api/admin/order/:id', async (req, res) => {

    await Order.findByIdAndDelete(

        req.params.id

    );

    res.json({

        success: true

    });

});

/* ================= SIGNUP ================= */

app.post('/api/signup', async (req, res) => {

    try {

        const {

            name,

            email,

            phone,

            password

        } = req.body;

        const existingUser = await User.findOne({

            email

        });

        if (existingUser) {

            return res.status(400).json({

                message: "Account already exists"

            });

        }

        const newUser = new User({

            name,

            email,

            phone,

            password

        });

        await newUser.save();

        res.status(201).json({

            success: true

        });

    } catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

/* ================= LOGIN ================= */

app.post('/api/login', async (req, res) => {

    try {

        const {

            email,

            password

        } = req.body;

        const user = await User.findOne({

            email,

            password

        });

        if (!user) {

            return res.status(401).json({

                success: false,

                message: "No Account Found"

            });

        }

        res.status(200).json({

            success: true,

            user

        });

    } catch (err) {

        res.status(500).json({

            success: false,

            error: err.message

        });

    }

});

/* ================= MY ORDERS ================= */

app.get('/api/my-orders/:email', async (req, res) => {

    try {

        const orders = await Order.find({

            userEmail: req.params.email

        }).sort({

            orderDate: -1

        });

        res.json(orders);

    } catch (err) {

        res.status(500).json({

            error: err.message

        });

    }

});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
});
