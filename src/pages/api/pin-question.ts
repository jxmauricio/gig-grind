import clientPromise from "../../lib/mongodb";
import { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const client = await clientPromise;
        const db = client.db("gig_grind");
        const doc = {questions : "What is horizontal scaling?",dateCreated: Date.now()}
        const result = await db
            .collection("pinned_questions")
            .insertOne(doc)
        res.json(result);
    } catch (e) {
        console.error(e);
    }
}