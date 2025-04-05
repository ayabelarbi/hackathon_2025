import {Request, Response, Router} from 'express';
import {Login, Signin, Wallet} from "../dto";
import mongoose from "mongoose";

const mongo = async (): Promise<void> => {
    try {
        await mongoose.connect('mongodb://localhost:27017/vemob');
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
};
mongo();

const router: Router = Router();

router.post('/signin', async (req: Request, res: Response): Promise<void> => {
    try {
        const signin = req.body as Signin;
        console.log(JSON.stringify(signin));
        const isNew = !await Wallet.exists({phone: signin.phone});
        if (isNew) {
            await Wallet.create({phone: signin.phone, wallet: signin.wallet});
            res.status(201).json({created: JSON.stringify(signin)});
        } else {
            res.status(200).json({ok: JSON.stringify(signin)});
        }
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const login = req.body as Login;
        const wallet = await Wallet.findOne({wallet: login.wallet});
        if (wallet) {
            const url = `https://web-production.lime.bike/api/rider/v1/login?phone=${encodeURIComponent(wallet.phone)}`;
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            res.status(response.status).json({phone: wallet.phone});

        } else {
            res.status(404).json({not_found: JSON.stringify(login)});
        }
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.get('/login/verify', async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("verify");
        res.status(200).json({message: "verify"});
    } catch (error) {
        res.status(500).json({message: "Internal Server Error"});
    }
})

router.delete('/db', async (_req: Request, res: Response): Promise<void> => {
    try {
        await Wallet.deleteMany();
        res.status(200).json({message: "Reset"});
    } catch (error) {
        res.status(500).json({message: "Reset Error"});
    }
});


export default router;



