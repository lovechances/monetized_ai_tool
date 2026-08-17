def summarize_text(text: str) -> str:
    cleaned_text = text.strip()

    if not cleaned_text:
        return "No text was provided to summarize."

    words = cleaned_text.split()

    preview = " ".join(words[:40])

    if len(words) > 40:
        preview += "..."

    return f"Summary preview: {preview}"