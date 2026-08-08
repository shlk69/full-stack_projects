import sql from "../configs/db.js";




export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth;

        const creations = await sql`
            SELECT *
            FROM creations
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `;

        return res.status(200).json({
            success: true,
            creations,
            plan: req.plan || "free",
        });
    } catch (error) {
        console.error("Get user creations error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


export const getPublishedCreations = async (req, res) => {
    try {
        const creations = await sql`
        SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;

        res.status(200).json({ success: true, creations });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}


export const toggleLikeCreation = async (req, res) => {
    try {
        const { userId } = req.auth;
        const { id } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized access." });
        }

        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

        if (!creation) {
            return res.status(404).json({ success: false, message: "Creation not found" });
        }

        const currentLikes = Array.isArray(creation.likes) ? creation.likes : [];
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if (currentLikes.includes(userIdStr)) {
            updatedLikes = currentLikes.filter((user) => user !== userIdStr);
            message = 'Creation unliked';
        } else {
            updatedLikes = [...currentLikes, userIdStr];
            message = 'Creation liked';
        }

        const formattedArray = `{${updatedLikes.join(',')}}`;

        await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`;

        return res.status(200).json({ success: true, message, likes: updatedLikes });
    } catch (error) {
        console.error("Toggle like error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}


