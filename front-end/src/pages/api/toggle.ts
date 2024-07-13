import { kv } from "@vercel/kv";
import type { NextApiRequest, NextApiResponse } from "next";

const ENVI = process.env.ENVI ?? "devv";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const buttonId = req.body.untrustedData?.buttonIndex || 2;
      const idNext = req.query.id as string;
      const id = idNext.slice(0, -1);

      let curr = Number(idNext[idNext.length - 1]);
      let next;

      const values = await kv.hgetall(`${id}:${ENVI}`) as {
        files: { url: string; created_at: number }[];
        password: string;
        frameRatio?: "1.91:1" | "1:1";
        readmore?: {
          link: string;
          label: string;
        };
      } | null;

      const returnedItems = values?.files || [];
      const sortedValues = returnedItems;
      const sortedValuesLength = sortedValues.length;

      if (buttonId === 2) {
        if (curr >= sortedValuesLength - 1) {
          curr = 0;
        } else {
          curr += 1;
        }
        next = curr + 1;
      } else if (buttonId === 1) {
        if (curr <= 0) {
          curr = sortedValuesLength - 1;
          next = curr;
        } else {
          curr -= 1;
          next = curr + 1;
        }
      } else if (buttonId === 3) {
        next = curr;
      }

      const currentItem = sortedValues[curr];
      const showReadMore = values?.readmore && curr === sortedValuesLength - 1;

      res.setHeader("Content-Type", "text/html");
      res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Gallery Item ${curr}</title>
          <meta property="og:title" content="Gallery Item ${curr}">
          <meta property="og:image" content="${currentItem.url}">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="${currentItem.url}">
          <meta name="fc:frame:button:1" content="Mint">
          <meta name="fc:frame:button:1:action" content="link">
          <meta name="fc:frame:button:1:target" content="https://tokenfest.vercel.app/launch/convert-proposal">
          
          ${showReadMore ? `
            <meta name="fc:frame:button:3" content="${values.readmore?.label ?? 'Read More'}">
            <meta name="fc:frame:button:3:action" content="link">
            <meta name="fc:frame:button:3:target" content="${values.readmore?.link}">
          ` : ''}
          ${values?.frameRatio ? `<meta name="fc:frame:image:aspect_ratio" content="${values.frameRatio}">` : ''}
          <meta name="of:version" content="vNext">
          <meta property="of:accepts:xmtp" content="2024-02-01">
          <meta property="of:accepts:lens" content="1.1">
          <meta name="of:image" content="${currentItem.url}">
          <meta name="of:button:1" content="Mint">
          <meta name="fc:frame:button:1:action" content="link">
          <meta name="fc:frame:button:1:target" content="https://tokenfest.vercel.app/launch/convert-proposal">
          ${showReadMore ? `
            <meta name="of:button:3" content="${values.readmore?.label ?? 'Read More'}">
            <meta name="of:button:3:action" content="link">
            <meta name="of:button:3:target" content="${values.readmore?.link}">
          ` : ''}
          ${values?.frameRatio ? `<meta name="of:image:aspect_ratio" content="${values.frameRatio}">` : ''}
        </head>
        <body>
        </body>
      </html>
      `);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error generating image");
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
