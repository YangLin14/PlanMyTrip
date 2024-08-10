# export GROQ_API_KEY=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

from groq import Groq

client = Groq()
completion = client.chat.completions.create(
    model="llama3-70b-8192",
    messages=[
        {
            "role": "user",
            "content": "create a list of things to pack and recommended go places for usr intended travel place"
        }
    ],
    temperature=1,
    max_tokens=1024,
    top_p=1,
    stream=True,
    stop=None,
)

for chunk in completion:
    print(chunk.choices[0].delta.content or "", end="")
