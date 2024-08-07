
import { generateComponents } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react/hooks";
import { OurFileRouter } from "../../server/uploadthing";


export const { UploadButton, UploadDropzone, Uploader } =
  generateComponents<OurFileRouter>();
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
