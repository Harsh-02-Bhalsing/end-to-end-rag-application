from typing import List
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
import io
from PyPDF2 import PdfReader
import csv
import pytesseract
from pdf2image import convert_from_bytes
import cv2
import numpy as np
from dotenv import load_dotenv
import os
load_dotenv()
pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_PATH")

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

def process_handwritten_pdf(file_bytes: bytes, metadata: dict):

    images = convert_from_bytes(
        file_bytes,
        poppler_path=os.getenv("POPPLER_PATH")
    )

    full_text = ""

    for img in images:

        img = np.array(img)

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        thresh = cv2.threshold(
            gray, 150, 255, cv2.THRESH_BINARY
        )[1]

        text = pytesseract.image_to_string(thresh)

        full_text += text + "\n"

    chunks = text_splitter.split_text(full_text)

    return [
        Document(page_content=chunk, metadata=metadata)
        for chunk in chunks
    ]