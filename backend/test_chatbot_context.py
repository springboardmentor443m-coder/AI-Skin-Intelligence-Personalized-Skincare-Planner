from chatbot import build_chat_messages


def test_context_is_included_when_present():
    context = {
        "condition": "Acne",
        "confidence": 0.95,
        "recommendation": "Use a salicylic acid cleanser and non-comedogenic moisturizer.",
    }

    messages = build_chat_messages("Recommend products", context)
    joined = "\n".join(message["content"] for message in messages)

    assert "Acne" in joined
    assert "95%" in joined
    assert "salicylic acid cleanser" in joined


def test_context_is_omitted_when_missing():
    messages = build_chat_messages("Hello")
    joined = "\n".join(message["content"] for message in messages)

    assert "Latest skin analysis" not in joined
