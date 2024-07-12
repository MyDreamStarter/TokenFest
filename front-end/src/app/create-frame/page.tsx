// pages/create-event.tsx

"use client";
import { Formik, Form } from "formik";
import { Input, InputNumber, DatePicker, Button } from "antd";
import { enqueueSnackbar } from "notistack";

import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import clsx from "clsx";
import { customAlphabet } from "nanoid";
import { useEffect, useRef, useState } from "react";

import slugify from "slugify";
import Nav3 from "@/components/common/Nav/nav3";
import { useUploadThing } from '@/libs/uploadthing'

const HOST = process.env.NEXT_PUBLIC_HOST;
const CreateEvent = () => {
  //---------------------------------------------------------------------------------------
  const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 7);
  const [initialUploadSortingType, setInitialUploadSortingType] = useState<File[]>([]);
  const [displayedFileList, setDisplayedFileList] = useState<File[]>([]);

  const [error, setError] = useState("");
  const [imageId, setImageId] = useState("");
  const imagesRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [warpcastUrl, setWarpcastUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [password, setPassword] = useState("");
  const [sortingType, setSortingType] = useState("");
  const [sortingMethod, setSortingMethod] = useState("asc");
  const readmoreRef = useRef<HTMLInputElement | null>(null);
  const [readmoreLabel, setReadmoreLabel] = useState("");
  const [readmoreLink, setReadmoreLink] = useState("");
  const [hasReadmore, setHasReadmore] = useState(false);
  const [frameRatio, setFrameRatio] = useState<"1.91:1" | "1:1">("1.91:1");

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => { },
    onUploadError: () => {
      throw new Error("something went wrong while uploading");
    },
    onUploadBegin: () => { },
  });

  function showImages(e: any) {
    setError("");
    let files = e.target.files as File[];
    if (files.length !== 1) {
      setError("Only one image is allowed");
      setInitialUploadSortingType([]);
      e.target.value = "";
      return;
    }
    const curr = files[0];
    const currType = curr.type.replace(/(.*)\//g, "");
    if (!["png", "jpeg", "jpg", "webp", "gif"].includes(currType)) {
      setError("Only jpeg, png, jpg, webp, and gif files are allowed");
      setInitialUploadSortingType([]);
      e.target.value = "";
      return;
    }
    setInitialUploadSortingType([curr]);
  }

  async function handleSubmit(event: any) {
    setError("");

    event.preventDefault();
    if (displayedFileList.length === 0) {
      setError("No File Chosen");
      return;
    }

    if (displayedFileList.length !== 1) {
      setError("Only one image is allowed");
      return;
    }

    if (hasReadmore && !readmoreLink) {
      setError('Enter an external link or uncheck the "Add read more" checkbox');
      return;
    }

    let usedReadMoreLabel = readmoreLabel;
    if (hasReadmore && !usedReadMoreLabel) usedReadMoreLabel = "Read More";

    setIsLoading(true);
    setLoadingMessage("Uploading Images...");

    let filesUploaded;

    try {
      const fileUploadResponse = await startUpload(displayedFileList).catch((err: any) => {
        console.log({ err });
      });
      filesUploaded = fileUploadResponse;
    } catch (error) {
      console.log({ error });
      setError("Something went wrong uploading the files");
    }

    if (filesUploaded) {
      setLoadingMessage("Creating Gallery...");
      const filesToSendToKVStore = filesUploaded.map((file: { url: any; }, index: number) => {
        return { url: file.url, created_at: Date.now() + index };
      });
      const sluggifiedId = slugify(imageId, {
        replacement: "-",
        trim: true,
      });

      const galleryId = sluggifiedId || nanoid();
      let payload;
      if (hasReadmore) {
        payload = {
          galleryId,
          filesToSendToKVStore,
          password,
          frameRatio,
          readmore: {
            label: usedReadMoreLabel,
            link: readmoreLink,
          },
        };
      } else {
        payload = {
          galleryId,
          filesToSendToKVStore,
          password,
          frameRatio,
        };
      }
      try {
        const res = await fetch("api/upload-gallery", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        if (!result.success) {
          throw new Error(result.error);
        }
        // event.target.reset();
        setInitialUploadSortingType([]);
        setError("");
        setWarpcastUrl(`${HOST}/gallery/${galleryId}`);
        setImageId("");
        setPassword("");
      } catch (error) {
        console.log({ error });
        //@ts-expect-error message not in error
        setError(error?.message);
      }
    }
    setIsLoading(false);
  }

  useEffect(() => {
    setDisplayedFileList(initialUploadSortingType);
    if (initialUploadSortingType.length == 0) {
      imagesRef.current!.value = "";
    }
    setSortingMethod("default");
    setSortingType("asc");
  }, [initialUploadSortingType]);

  useEffect(() => {
    let finalDisplayedData: File[] = [];
    switch (sortingType) {
      case "default":
        finalDisplayedData = [...initialUploadSortingType];
        break;
      case "date":
        finalDisplayedData = [...initialUploadSortingType].sort(
          (a, b) => a.lastModified - b.lastModified
        );
        break;
      case "name":
        finalDisplayedData = [...initialUploadSortingType].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        break;
      case "size":
        finalDisplayedData = [...initialUploadSortingType].sort(
          (a, b) => a.size - b.size
        );
        break;
    }
    if (sortingMethod === "desc") {
      finalDisplayedData = [...finalDisplayedData].reverse();
    }
    setDisplayedFileList(finalDisplayedData);
  }, [sortingType]);
  useEffect(() => {
    setDisplayedFileList([...displayedFileList].reverse());
  }, [sortingMethod]);

  function formatFileSize(_size: number) {
    var fSExt = new Array("Bytes", "KB", "MB", "GB"),
      i = 0;
    while (_size > 900) {
      _size /= 1024;
      i++;
    }
    var exactSize = Math.round(_size * 100) / 100 + " " + fSExt[i];
    return exactSize;
  }

  console.log({ frameRatio });
  //-------------------------------------------------------------------------
  const router = useRouter();

  interface FormMessage {
    description: string;
    title: string;
    priceperNFT: number;
    funding_goal: number;
    proposal_type: string;
    date: any;
  }

  const initialValues: FormMessage = {
    title: "",
    description: "",
    priceperNFT: 1,
    funding_goal: 20,
    proposal_type: "",
    date: ``,
  };
  let submitAction: string | undefined = undefined;

  return (
    <>
    <Nav3/>


      <main className="flex flex-col bg-blue-200">
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-blue-200 p-10 rounded shadow-lg">
            <Formik
              initialValues={initialValues}
              onSubmit={(values, actions) => {
                const { title, description, priceperNFT, funding_goal, date } = values;

                const queryParams = new URLSearchParams({
                  title,
                  description,
                  priceperNFT: priceperNFT.toString(),
                  funding_goal: funding_goal.toString(),
                  date: dayjs(date).toISOString(),
                }).toString();

                if (submitAction === "primary") {
                  router.push(`/voyager/soloraids?${queryParams}`);
                  enqueueSnackbar(`${values.title} has been proposed`, {
                    variant: "success",
                  });
                } else {
                  handleSubmit(event)

                }
                actions.setSubmitting(false);
              }}
            >
              {({ setFieldValue, values }) => (
                <Form>
                  <div className="text-black text-2xl mb-1 font-semibold">
                    Create a Proposal
                  </div>
                  <div className="text-black mb-6 italic">
                    Submit your proposal ideas for community crowdfunding
                  </div>
                  <div className="text-black flex flex-col gap-6">
                    <div>
                      <label className="font-medium" htmlFor="title">
                        Proposal Title
                      </label>
                      <div className="mt-2 w-[300px]">
                        <Input
                          style={{ background: "#4AA5F4" }}
                          className="rounded-full text-white"
                          required
                          value={values.title}
                          onChange={(e) => {
                            setImageId(e.target.value); // Update imageId state
                            setFieldValue("title", e.target.value); // Update title field value
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <input
                        name="password"
                        id="password"
                        placeholder="Enter a password (optional)"
                        className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                        }}
                      />
                    </div>
                    <div>
                      <label className="font-medium" htmlFor="description">
                        Description
                      </label>
                      <div className="mt-2 w-[300px]">
                        <Input.TextArea
                          style={{ background: "#4AA5F4" }}
                          className="rounded-full text-white"
                          required
                          value={values.description}
                          onChange={(e) => {
                            setFieldValue("description", e.target.value);
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <select
                        className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                        onChange={(e) => {
                          const value = e.target.value;
                          if (!value || !(value == "1.91:1" || value == "1:1")) return;
                          setFrameRatio(value);
                        }}
                      >
                        <option value="" selected disabled>
                          Change Frame Ratio
                        </option>
                        <option value="1.91:1">1.91:1(default)</option>
                        <option value="1:1">1.1</option>
                      </select>
                    </div>

                    <input
                      ref={imagesRef}
                      multiple
                      type="file"
                      id="nft"
                      name="nft"
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                      className="pl-3 pr-28 py-3 mt-1 text-lg block w-full border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                      onChange={showImages}
                    />
                    <div className="filenames">
                      {displayedFileList.map((file, index) => {
                        return (
                          <li key={`file-${index}`}>
                            {file.name}: {formatFileSize(file.size)}
                          </li>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-8">
                      <div>
                        <label className="font-medium" htmlFor="priceperNFT">
                          Price per NFT
                        </label>
                        <div className="mt-2">
                          <InputNumber
                            style={{ background: "#4AA5F4" }}
                            className="rounded-full text-white"
                            required
                            value={values.priceperNFT}
                            onChange={(e) => {
                              setFieldValue("priceperNFT", e);
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="font-medium" htmlFor="funding_goal">
                          Funding Goal
                        </label>
                        <div className="mt-2">
                          <InputNumber
                            style={{ background: "#4AA5F4" }}
                            className="rounded-full text-white"
                            required
                            value={values.funding_goal}
                            onChange={(e) => {
                              setFieldValue("funding_goal", e);
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className=" text-lg text-start gap-2">
                      <div className="px-2">
                        <input
                          onChange={(e) => {
                            setHasReadmore((current) => !current);
                          }}
                          ref={readmoreRef}
                          id="read-more"
                          name="read-more"
                          type="checkbox"
                        />
                        <label className="text-xl mx-1" htmlFor="read-more">
                          Add Read More Button
                        </label>
                      </div>
                      {hasReadmore ? (
                        <>
                          <input
                            required
                            value={readmoreLink}
                            onChange={(e) => {
                              setReadmoreLink(e.target.value);
                            }}
                            type="text"
                            placeholder="Enter the external link here"
                            className="pl-3 pr-28 py-3 mt-1 my-2
                    text-lg block w-full border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                          />
                          <input
                            value={readmoreLabel}
                            onChange={(e) => {
                              setReadmoreLabel(e.target.value);
                            }}
                            className="pl-3 pr-28 py-3 mt-1 my-2 text-lg block w-full border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300"
                            type="text"
                            placeholder="Button label (optional. Defaults to 'Read More'"
                          />
                        </>
                      ) : null}
                    </div>
                    <div>
                      <label htmlFor="date" className="block mb-2">
                        Valid till
                      </label>
                      <DatePicker
                        style={{ background: "#4AA5F4" }}
                        className="rounded-full text-white"
                        onChange={(e) => {
                          setFieldValue("date", e);
                        }}
                      />
                    </div>
                  </div>
                  <div className={"pt-4 flex gap-4"}>

                    <button
                      className={clsx(
                        "flex items-center p-1 justify-center px-4 h-10 text-lg border bg-blue-500 text-white rounded-md focus:outline-none focus:ring focus:ring-blue-300 hover:bg-blue-700 focus:bg-blue-700",
                        isLoading &&
                        "disabled cursor-not-allowed bg-blue-100 hover:bg-blue-100 focus:bg-blue-100"
                      )}
                      id="propose"
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? loadingMessage : "Create frames"}
                    </button>
                  </div>
                  <div className="mt-5">

                  </div>
                </Form>

              )}


            </Formik>

          </div>
          {warpcastUrl && (
            <div className="flex items-center gap-2 bg-purple-900 text-white p-4 m-2 z-10">
              <span>
                Share on warpcast:
                <span className="m-1 text-green-200">{warpcastUrl}</span>
              </span>
              <button
                className={clsx("bg-orange-600 px-2 py-1 rounded-lg")}
                onClick={() => {
                  navigator.clipboard.writeText(warpcastUrl);
                  setCopied(true);
                }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}

          <div className="w-screen"></div>

        </div>
      </main>
    </>
  );

  // form.tsx
};

export default CreateEvent;
