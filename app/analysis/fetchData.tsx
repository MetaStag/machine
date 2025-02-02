import { useState, useEffect } from "react";
import Papa from "papaparse";
import markdownit from "markdown-it"
import OpenAI from "openai";

export default function FetchData() {
  const [response, setResponse] = useState(
    "Analyzing... this might take some time"
  );
  const [data, setData] = useState("");
  const md = markdownit()
  const client = new OpenAI({
    baseURL: "https://llm-gateway.heurist.xyz",
    apiKey: process.env.NEXT_PUBLIC_HEURIST_API_KEY,
    dangerouslyAllowBrowser: true,
  });
  let model = "deepseek/deepseek-r1";
  const csvUrl = "/data.csv";

  useEffect(() => {
    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        setData(result.data);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }, []);

  useEffect(() => {
    let msgs = [
      {
        role: "system",
        content: `
      You are a crypto currency expert that analyzes this text containing information about the time stamp of coin, price, volume, mean price, price standard deviation, z score, whether the trade might be anomalous and residual Z score.
  
  In the anomaly part, if the value is 1, then it is an anomaly, if it is -1, then it is not an anomaly
  
  You have to extract as much information as possible from the graph and be as explicit and specific about the details.
  
  Make the outputs in bullet points, giving information about the data, the trends you notice, the dips you notice, guessing the possible reasons for the dip, etc.
  
  You have to help the user make an informed decision from this data, while keeping all the terminologies used in output as layman as possible.
  
  You can also give advice based on recent trends for short term and longer term investors
  
  Also account for any holidays or festive activities in your analysis.
  
  Use emojis where possible to appear user friendly and attractive.
  
  Make it very clear that this is just a prediction and may not be 100% accurate
       `,
      },

      {
        role: "user",
        content: data,
      },
    ];
    const getData = async () => {
      const chatCompletion = await client.chat.completions.create({
        messages: msgs,
        model: model,
        stream: true,
      });
      let flag = false;
      let temp = "";
      let responseText = "";
      for await (const chunk of chatCompletion) {
        temp = chunk.choices[0].delta.content || "";
        if (temp == undefined) {
          chatCompletion.controller.abort();
          break;
        }
        if (flag) {
          responseText += temp;
        } else if (temp.includes("</think>")) {
          flag = true;
          responseText += temp.substring(temp.indexOf("</think>") + 9);
        }
      }
      const result = md.render(responseText)
      setResponse(result)
    };
    getData().catch(console.error);
  }, []);
  return <div className="bg-gray-700 p-4 rounded-md" dangerouslySetInnerHTML={{ __html: response}}></div>;
}
