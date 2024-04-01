require("dotenv").config();

// --------------------------------------------------------- 환경변수 

const express = require("express");
const bodyParser = require("body-parser");
const { Sequelize, Op } = require("sequelize");
const controllers = require("./controllers/controllers");
const { OpenAI } = require("openai");
const {
  User,
  Product,
  Purchase,
  Review,
} = require("./models/models");
const openai = new OpenAI(process.env.OPENAI_API_KEY);
const app = express();
const language = require("@google-cloud/language");
const languageClient = new language.LanguageServiceClient();


// ----------------------------------------------------------------- const/require

app.set("view engine", "ejs");

// ----------------------------------------------------------------- set


async function analyzeSentiment(text) {
  const document = {
    content: text,
    type: "PLAIN_TEXT",
  };
  const [result] = await languageClient.analyzeSentiment({ document });
  const sentiment = result.documentSentiment;
  return sentiment.score; // -0.1 ~ 0.1
}

async function getGptSummary(text) {
  try {
      const completion = await openai.completions.create({
          model: "gpt-3.5-turbo",
          prompt: `Summarize these product reviews: "${text}"`,
          temperature: 0.7,
          max_tokens: 150,
          top_p: 1.0,
          frequency_penalty: 0.0,
          presence_penalty: 0.0,
      });

      return completion.choices[0].text.trim();
  } catch (error) {
      console.error('Error calling OpenAI:', error);
      return '';
  }
}

// ----------------------------------------------------------------------------- function

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ----------------------------------------------------------------------------- Use

app.get("/", (req, res) => res.render("signin"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/signin", (req, res) => res.render("signin"));
app.get("/purchase", async (req, res) => {
  const userId = req.query.userId; 
  if (!userId) {
    return res.status(400).send("User ID is required");
  }
  try {
    const purchases = await Purchase.findAll({
      where: { user_id: userId },
      include: [Product], 
    });

    res.render("purchase", { purchases }); 
  } catch (error) {
    console.error("Error fetching purchase history:", error);
    res.status(500).send("Error fetching purchase history");
  }
});
app.get("/product-detail", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{
        model: Review,
        required: false,
      }],
    });
    for (const product of products) {
      const sortedReviews = [...product.Reviews].sort((a, b) => b.percent - a.percent);
      product.topReviews = sortedReviews.slice(0, 2);
      product.bottomReviews = sortedReviews.slice(-2);
      const reviewsText = product.Reviews.map(review => review.comment).join(" ");
      if (reviewsText) {
        product.gptSummary = "GPT API 사용료 지불시 요약된 결과를 확인하실 수 있습니다."
      } else {
        product.gptSummary = "아직 리뷰가 작성되지 않았습니다.";
      }
    }
    res.render("product-detail", { product: products });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).send("Server Error");
  }
});
app.get("/order", async (req, res) => {
  try {
      const products = await Product.findAll({
          include: [{
              model: Review,
              required: false,
          }],
          order: [['percent', 'DESC']],
          limit: 3,
      });

      for (const product of products) {
          const sortedReviews = [...product.Reviews].sort((a, b) => b.percent - a.percent);
          product.topReviews = sortedReviews.slice(0, 2);
          product.bottomReviews = sortedReviews.slice(-2);
      
          const reviewsText = product.Reviews.map(review => review.comment).join(" ");
          if (reviewsText) {
              product.gptSummary = "GPT API 사용료 지불시 요약된 결과를 확인하실 수 있습니다."
          } else {
              product.gptSummary = "아직 리뷰가 작성되지 않았습니다.";
          }
      }

      res.render("order", { topProducts: products });
  } catch (error) {
      console.error("Failed to fetch products and reviews:", error);
      res.status(500).send("Server Error");
  }
});
app.get("/search", async (req, res) => {
  const searchQuery = req.query.query;
  try {
    const searchResults = await Product.findAll({
      where: {
        product_name: {
          [Op.like]: `%${searchQuery}%`,
        },
      },
    });
    res.render("product-detail", { product: searchResults });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).send("Server Error");
  }
});

// ----------------------------------------------------------------------------- Get

app.post("/signup", controllers.signUp);
app.post("/signin", controllers.signIn);
app.post("/send-order", controllers.sendOrder);
app.post("/submit-review", async (req, res) => {
    const { userId, productId, reviewText } = req.body;
    if (!userId || !productId || !reviewText) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
    }
    try {
        const sentimentScore = await analyzeSentiment(reviewText);
        await Review.create({
            user_id: userId,
            product_id: productId,
            comment: reviewText,
            percent: sentimentScore * 100 
        });
        const [averagePercent] = await Review.findAll({
            where: { product_id: productId },
            attributes: [[Sequelize.fn('avg', Sequelize.col('percent')), 'averagePercent']],
            raw: true,
        });
        await Product.update({ percent: averagePercent.averagePercent }, { where: { product_id: productId } });
        res.json({ success: true, message: "리뷰가 등록되었습니다." });
    } catch (error) {
        console.error("Error submitting review:", error);
        res.status(500).json({ success: false, message: "리뷰 제출 중 문제가 발생했습니다." });
    }
});

// ----------------------------------------------------------------------------- Post

app.listen(3000, () => {
  console.log("서버가 실행 중입니다. 3000 포트로!");
});


// ---------------------------------------------------------------------------- Listen