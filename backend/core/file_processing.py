from typing import List
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
import io
from PyPDF2 import PdfReader
import csv

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=150,
    separators=["\n\n", "\n", ".", " ", ""]
)


def process_txt(
    file_bytes:bytes,
    metadata:dict
)->List[Document]:
  
  text=file_bytes.decode("utf-8")

  if not text.strip():
    raise ValueError("text file is empty")
  
  chunks=text_splitter.split_text(text)

  return [
    Document(page_content=chunk,metadata=metadata)
    for chunk in chunks
  ]

def process_pdf(
    file_bytes:bytes,
    metadata:dict
)->List[Document]:
  
  reader=PdfReader(io.BytesIO(file_bytes))
  full_text=""

  for page in reader.pages:
    page_text=page.extract_text()
    if page_text:
      full_text+=page_text+"\n"

  if not full_text.strip():
    raise ValueError("pdf file contains no extractable text")
  
  chunks=text_splitter.split_text(full_text)

  return [
    Document(page_content=chunk,metadata=metadata)
    for chunk in chunks
  ]
  

def process_csv(
    file_bytes:bytes,
    metadata:dict
)->List[Document]:
  
  decoded=file_bytes.decode("utf-8")
  reader=csv.reader(io.StringIO(decoded))

  rows=[]

  for row in reader:
    rows.append(",".join(row))
  
  if not row:
    raise ValueError("csv file is empty")
  
  text="\n".join(rows)

  chunks=text_splitter.split_text(text)

  return [
    Document(page_content=chunk,metadata=metadata)
    for chunk in chunks
  ]