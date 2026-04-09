import express from 'express';
import { exec } from 'child_process';

const app = express();

app.get('/download', async (req, res) => {
    const id = req.query.id;
    const url = `https://www.youtube.com/watch?v=${id}`;

    const cmd = `chmod +x ./bin/yt-dlp && ./bin/yt-dlp --cookies ./cookies/cookies.txt -F "https://www.youtube.com/watch?v=dQw4w9WgXcQ"`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(error);
            return res.status(500).send(error.message);
        }

        res.download(`/tmp/${id}.m4a`);
    });
});

app.listen(8080, () => console.log('API running on port 8080'));
