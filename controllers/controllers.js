const { User, Product, Purchase } = require('../models/models');

exports.signUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        await User.create({ username, email, password });
        res.json({ code: 200, message: '회원가입에 성공했습니다.' });
    } catch (err) {
        console.error(err);
        res.json({ code: 500, message: '회원가입에 실패했습니다.' });
    }
};

exports.signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.json({ code: 404, message: '존재하지 않는 계정입니다.' });
        }
        if (password !== user.password) {
            return res.json({ code: 401, message: '비밀번호가 일치하지 않습니다.' });
        }
        res.json({ code: 200, message: '로그인 성공!', userId: user.user_id });
    } catch (err) {
        console.error(err);
        res.json({ code: 500, message: '로그인 처리 중 에러가 발생했습니다.' });
    }
};



exports.sendOrder = async (req, res) => {
    try {
        const userId = req.body.userId;
        const productId = req.body.productId;
        const user = await User.findByPk(userId);
        const product = await Product.findByPk(productId);

        if (!user || !product) {
            return res.status(404).json({ message: '사용자 또는 상품을 찾을 수 없습니다.' });
        }

        const purchase = await Purchase.create({
            user_id: userId,
            product_id: productId,
            purchase_date: new Date(),
        });

        res.json({ code: 200, message: '구매가 성공적으로 처리되었습니다.', purchaseId: purchase.id });
    } catch (error) {
        console.error('주문 처리 중 오류 발생:', error);
        res.status(500).json({ message: '주문 처리 중 오류가 발생했습니다.' });
    }
};



