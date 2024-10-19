import { strict as assert } from 'assert';

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  model: string = "Meta-Llama-3.1-8B-Instruct", // Default model for ArliAI
  temperature: number = 0.7,
  num_tries: number = 3,
  verbose: boolean = false
): Promise<{ question: string; answer: string; }[]> {
  
  const list_input: boolean = Array.isArray(user_prompt);
  const dynamic_elements: boolean = /<.*?>/.test(JSON.stringify(output_format));
  const list_output: boolean = /\[.*?\]/.test(JSON.stringify(output_format));
  
  let error_msg: string = "";

  for (let i = 0; i < num_tries; i++) {
    let output_format_prompt: string = `\nYou are to output the following in JSON format: ${JSON.stringify(
      output_format
    )}. \nDo not include quotation marks or escape characters (\\) in the output fields.`;

    if (list_output) {
      output_format_prompt += `\nIf an output field is a list, classify output into the best element of the list.`;
    }

    if (dynamic_elements) {
      output_format_prompt += `\nAny text enclosed by < and > indicates you must generate content to replace it. Example input: Go to <location>, Example output: Go to the garden.\nAny output key containing < and > indicates you must generate the key name to replace it.`;
    }

    if (list_input) {
      output_format_prompt += `\nGenerate a list of JSON, one JSON for each input element.`;
    }

    let res: string = "";

    try {
      // Prepare the fetch request for ArliAI API
      const response = await fetch("https://api.arliai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.ARLIAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: system_prompt + output_format_prompt + error_msg },
            { role: "user", content: Array.isArray(user_prompt) ? user_prompt.join('\n') : user_prompt }
          ],
          repetition_penalty: 1.1,
          temperature: temperature,
          top_p: 0.9,
          top_k: 40,
          max_tokens: 1024,
          stream: false // Set to false unless you want streaming
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      res = data.choices?.[0]?.message?.content?.replace(/'/g, '"') ?? "";

      // Log responses for debugging
      if (verbose) {
        console.log("System prompt:", system_prompt + output_format_prompt + error_msg);
        console.log("User prompt:", user_prompt);
        console.log("ArliAI response:", res);
      }

      // Parse the response to JSON
      let output: any;

      output = JSON.parse(res);

      // Validate output based on list input
      if (list_input && !Array.isArray(output)) {
        throw new Error("Output format not in a list of JSON");
      }

      output = list_input ? output : [output];

      for (let index = 0; index < output.length; index++) {
        for (const key in output_format) {
          if (/<.*?>/.test(key)) {
            continue;
          }

          if (!(key in output[index])) {
            throw new Error(`${key} not in JSON output`);
          }

          if (Array.isArray(output_format[key])) {
            const choices = output_format[key] as string[];
            if (Array.isArray(output[index][key])) {
              output[index][key] = output[index][key][0];
            }
            if (!choices.includes(output[index][key]) && default_category) {
              output[index][key] = default_category;
            }
            if (output[index][key].includes(":")) {
              output[index][key] = output[index][key].split(":")[0];
            }
          }
        }

        // Only return output values if requested
        if (output_value_only) {
          output[index] = Object.values(output[index]);
          if (output[index].length === 1) {
            output[index] = output[index][0];
          }
        }
      }

      return list_input ? output : output[0];
    } catch (e) {
      error_msg = `\n\nResult: ${res}\n\nError message: ${e}`;
      console.log("An exception occurred:", e);
      console.log("Current invalid json format:", res); // Using 'res' in the error log
    }
  }

  return [];
}
