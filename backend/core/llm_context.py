def get_context_string(docs):
  context_text=""
  for doc in docs:
    context_text+=doc.page_content
  return context_text