"use client";

import { useState, useRef, useEffect } from "react";
import { Formik, Form } from "formik";
import { Input, InputNumber, DatePicker, Button, Radio } from "antd";
import { enqueueSnackbar } from "notistack";
import dayjs from "dayjs";
import clsx from "clsx";
import slugify from "slugify";
import Nav3 from "@/components/common/Nav/nav3";
import { useProposal } from "@/ContextProviders/ProposalProvider";
import { useUploadThing } from '@/libs/uploadthing';
import { customAlphabet } from "nanoid";

const HOST = process.env.NEXT_PUBLIC_HOST;

const CreateCombined = () => {
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => { },
    onUploadError: () => {
      throw new Error("something went wrong while uploading");
    },
    onUploadBegin: () => { },
  });

  const { setProposal } = useProposal();

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

  async function handleSubmit(values: FormMessage, actions: unknown) {
    setError("");

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
            label: readmoreLabel || "Read More",
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

  return (
    <>
      <Nav3 />
      <main className="flex flex-col bg-blue-200">
        <div className="flex-grow flex items-center justify-center">
          <div className="bg-blue-200 p-10 rounded shadow-lg">
            <Formik
              initialValues={initialValues}
              onSubmit={(values, actions) => {
                setProposal(values);
                handleSubmit(values, actions);
                enqueueSnackbar(`${values.title} has been created`, {
                  variant: "success",
                });
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
                            setFieldValue("title", e.target.value);
                          }}
                        />
                      </div>
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
                    <div className="flex flex-col md:flex-row md:gap-8">
                      <div>
                        <label className="font-medium" htmlFor="priceperNFT">
                          Price per NFT
                        </label>
                        <div className="mt-2 w-[300px]">
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
                        <div className="mt-2 w-[300px]">
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
                    <Radio.Group
                      onChange={(e) => {
                        setFieldValue("proposal_type", e.target.value);
                      }}
                      value={values.proposal_type}
                    >
                      <Radio value={"collab"} className="!font-raleway text-black">
                        TokenFest Collab
                      </Radio>
                      <Radio value={"holder"} className="!font-raleway text-black">
                        TokenFest Subscription
                      </Radio>
                    </Radio.Group>
                    <div>
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
                    <div>
                      <label htmlFor="frameRatio" className="block mb-2">
                        Frame Ratio
                      </label>
                      <select
                        id="frameRatio"
                        className="rounded-full w-[300px] p-2"
                        value={frameRatio}
                        onChange={(e) => setFrameRatio(e.target.value as "1.91:1" | "1:1")}
                      >
                        <option value="1.91:1">1.91:1</option>
                        <option value="1:1">1:1</option>
                      </select>
                    </div>
                    <div className="w-[300px]">
                      <label className="block mb-2">Upload Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        ref={imagesRef}
                        onChange={showImages}
                        className="mb-4"
                      />
                      {error && <div className="text-red-500">{error}</div>}
                    </div>
                  </div>
                  <div className="mt-5">
                    <Button
                      style={{ color: "white", borderRadius: '9999px', background: "#0F4C81" }}
                      className="hover:bg-sky-500"
                      htmlType="submit"
                      loading={isLoading}
                    >
                      Create frames
                    </Button>
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
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </main>
    </>
  );
};

export default CreateCombined;
