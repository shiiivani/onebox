import React, { useEffect, useState } from "react";
import "../styles/Inbox.css";
import logo from "../assets/logo2.png";
import logoDark from "../assets/logo_dark.png";
import mail from "../assets/email.png";
import send from "../assets/send.png";
import draft from "../assets/drafts.png";
import reply from "../assets/reply.png";
import close from "../assets/close.png";
import close2 from "../assets/close2.png";
import arrowDown from "../assets/arrow-down.png";
import saveDraft from "../assets/draft.png";
import { Editor, EditorState, RichUtils } from "draft-js";
import "draft-js/dist/Draft.css";
import bold from "../assets/bold.png";
import italic from "../assets/italic-font.png";
import axios from "axios";
import { stateToHTML } from "draft-js-export-html";

function Onebox() {
  const [toggleButton, setToggleButton] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [data, setData] = useState([]);
  const token = localStorage.getItem("authToken");
  const [activeIndex, setActiveIndex] = useState(0);
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [replyBox, setReplyBox] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [dropdown1, setDropdown1] = useState(false);
  const [dropdown2, setDropdown2] = useState(false);
  const [sidePanel, setSidePanel] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  const activeSender = activeIndex !== null ? data[activeIndex] : null;

  const handleClick = (index) => {
    setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://hiring.reachinbox.xyz/api/v1/onebox/list",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await response.json();
        setData(result.data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (activeSender) {
      setTo(activeSender.toEmail || "");
      setFrom(activeSender.fromEmail || "");
      setSubject(activeSender.subject || "");
    }
  }, [activeSender]);

  const toggleModal = () => {
    setReplyBox(!replyBox);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "r" || event.key === "R") {
        toggleModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [replyBox]);

  function formatDate(dateString) {
    const options = { month: "short", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  }

  const secondDateFormate = (dateString) => {
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", options);
  };

  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const toggleInlineStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const rawContent = JSON.stringify(contentState);
  };

  const handleSubmit = async (id) => {
    const body = stateToHTML(editorState.getCurrentContent());
    try {
      const response = await axios.post(
        `https://hiring.reachinbox.xyz/api/v1/onebox/reply/${id}`,
        { from, to, subject, body },

        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Reply sent:", response.data);
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };

  return (
    <div
      className={
        toggleButton
          ? "onebox light flex flex-col items-center"
          : "onebox flex flex-col items-center"
      }
    >
      {/* Side Panel */}
      <div
        className={
          toggleButton
            ? "side-panel light flex flex-col items-center justify-between"
            : "side-panel flex flex-col items-center justify-between"
        }
      >
        {toggleButton ? (
          <img
            src={logoDark}
            width="40px"
            alt="logo"
            onClick={() => setSidePanel(!sidePanel)}
          />
        ) : (
          <img
            src={logo}
            width="40px"
            alt="logo"
            onClick={() => setSidePanel(!sidePanel)}
          />
        )}
        <div className="middle">
          <svg
            width="40"
            height="42"
            viewBox="0 0 28 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.30783 9.75731C6 10.4266 6 11.188 6 12.7109V17.4668C6 19.5817 6 20.6391 6.65701 21.2961C7.26684 21.906 8.22167 21.9497 10.0469 21.9529C10.0469 21.9513 10.0469 21.9498 10.0469 21.9482V16.3403C10.0469 15.1686 10.9967 14.2188 12.1685 14.2188H15.5332C16.7049 14.2188 17.6548 15.1686 17.6548 16.3403V21.9482C17.6548 21.9498 17.6548 21.9513 17.6548 21.9529C19.4803 21.9497 20.4352 21.906 21.0451 21.2961C21.7021 20.6391 21.7021 19.5817 21.7021 17.4668V12.7109C21.7021 11.188 21.7021 10.4266 21.3943 9.75731C21.0865 9.08802 20.5084 8.59249 19.3521 7.60145L18.2306 6.64009C16.1407 4.84878 15.0958 3.95312 13.8511 3.95312C12.6064 3.95312 11.5614 4.84878 9.47158 6.64009L9.47158 6.64009L8.35 7.60145C7.19377 8.59249 6.61566 9.08802 6.30783 9.75731ZM15.6548 21.9531C15.6548 21.9515 15.6548 21.9499 15.6548 21.9482V16.3403C15.6548 16.2732 15.6003 16.2188 15.5332 16.2188H12.1685C12.1013 16.2188 12.0469 16.2732 12.0469 16.3403V21.9482C12.0469 21.9499 12.0469 21.9515 12.0469 21.9531H15.6548Z"
              fill="#AEAEAE"
            />
          </svg>
          <svg
            width="40"
            height="42"
            viewBox="0 0 28 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 14C14.2091 14 16 12.2091 16 10C16 7.79086 14.2091 6 12 6C9.79086 6 8 7.79086 8 10C8 12.2091 9.79086 14 12 14Z"
              fill="#AEAEAE"
            />
            <path
              d="M12.35 16.01C9.62 15.91 4 17.27 4 20V22H13.54C11.07 19.24 12.31 16.11 12.35 16.01Z"
              fill="#AEAEAE"
            />
            <path
              d="M21.43 20.02C21.79 19.43 22 18.74 22 18C22 15.79 20.21 14 18 14C15.79 14 14 15.79 14 18C14 20.21 15.79 22 18 22C18.74 22 19.43 21.78 20.02 21.43L22.59 24L24 22.59L21.43 20.02ZM18 20C16.9 20 16 19.1 16 18C16 16.9 16.9 16 18 16C19.1 16 20 16.9 20 18C20 19.1 19.1 20 18 20Z"
              fill="#AEAEAE"
            />
          </svg>
          <svg
            width="40"
            height="42"
            viewBox="0 0 28 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21.2 7.5H6.8C5.81 7.5 5.009 8.31 5.009 9.3L5 20.1C5 21.09 5.81 21.9 6.8 21.9H21.2C22.19 21.9 23 21.09 23 20.1V9.3C23 8.31 22.19 7.5 21.2 7.5ZM21.2 11.1L14 15.6L6.8 11.1V9.3L14 13.8L21.2 9.3V11.1Z"
              fill="#AEAEAE"
            />
          </svg>
          <svg
            width="40"
            height="42"
            viewBox="0 0 28 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.7381 23.5C16.0667 23.5 16.3472 23.3754 16.5795 23.1261C16.8118 22.8824 17.0072 22.5567 17.1659 22.1487L22.7664 7.48867C22.8401 7.29603 22.8967 7.11756 22.9364 6.95326C22.9761 6.78895 22.9959 6.63314 22.9959 6.48584C22.9959 6.18555 22.9081 5.94759 22.7324 5.77195C22.5568 5.59065 22.3188 5.5 22.0186 5.5C21.8769 5.5 21.7211 5.52266 21.5511 5.56799C21.3812 5.60765 21.1999 5.66147 21.0072 5.72946L6.29618 11.364C5.92791 11.5057 5.61913 11.6926 5.36983 11.9249C5.12621 12.1572 5.00439 12.4377 5.00439 12.7663C5.00439 13.1686 5.14037 13.466 5.41233 13.6586C5.68428 13.8456 6.02706 14.0014 6.44065 14.1261L10.8514 15.4773C11.146 15.568 11.3925 15.6048 11.5908 15.5878C11.7891 15.5652 11.9931 15.4575 12.2027 15.2649L21.6616 6.49433C21.7183 6.44334 21.7778 6.41785 21.8401 6.41785C21.9081 6.41785 21.9676 6.44051 22.0186 6.48584C22.0639 6.53116 22.0865 6.58782 22.0865 6.65581C22.0865 6.71813 22.0582 6.77762 22.0016 6.83428L13.265 16.3187C13.0837 16.5113 12.9789 16.7096 12.9506 16.9136C12.9279 17.1176 12.9591 17.3697 13.0441 17.67L14.3528 21.9873C14.4831 22.4235 14.6446 22.7833 14.8373 23.0666C15.0299 23.3555 15.3302 23.5 15.7381 23.5Z"
              fill="#AEAEAE"
            />
          </svg>
          <svg
            width="40"
            height="42"
            viewBox="0 0 28 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 17H9V13H5V17ZM5 22H9V18H5V22ZM5 12H9V8H5V12ZM10 17H23V13H10V17ZM10 22H23V18H10V22ZM10 8V12H23V8H10Z"
              fill="#AEAEAE"
            />
          </svg>
          <svg
            width="35"
            height="38"
            viewBox="0 0 20 15"
            xmlns="http://www.w3.org/2000/svg"
            className="active"
          >
            <path
              d="M2.7691 14.7857H17.2225C18.1399 14.7857 18.8321 14.5619 19.2993 14.1144C19.7664 13.6669 20 13.0038 20 12.1251V7.54871C20 7.24853 19.9803 6.99475 19.9409 6.78735C19.9071 6.57996 19.848 6.39439 19.7636 6.23066C19.6848 6.06693 19.5751 5.89228 19.4344 5.70671L16.6568 2.11277C16.3304 1.68707 16.0349 1.3596 15.7704 1.13037C15.5058 0.895688 15.2104 0.731955 14.8839 0.639173C14.5575 0.546391 14.141 0.5 13.6344 0.5H6.36555C5.85338 0.5 5.43408 0.546391 5.10764 0.639173C4.78683 0.731955 4.49416 0.895688 4.22963 1.13037C3.9651 1.3596 3.66962 1.68707 3.34318 2.11277L0.565639 5.70671C0.424933 5.89228 0.312368 6.06693 0.227944 6.23066C0.14352 6.39439 0.0844238 6.57996 0.0506543 6.78735C0.0168848 6.99475 0 7.24853 0 7.54871V12.1251C0 13.0038 0.233573 13.6669 0.700718 14.1144C1.16786 14.5619 1.85732 14.7857 2.7691 14.7857ZM9.99578 9.77548C9.57366 9.77548 9.20501 9.67997 8.88983 9.48895C8.58027 9.29247 8.34107 9.04141 8.17222 8.73578C8.00338 8.42468 7.91895 8.09722 7.91895 7.75338V7.69607C7.91895 7.51051 7.85986 7.34404 7.74166 7.19668C7.62347 7.04387 7.44337 6.96746 7.20135 6.96746H2.09371C1.94175 6.96746 1.84888 6.91834 1.81511 6.8201C1.78134 6.72186 1.80386 6.62089 1.88265 6.51719L4.95568 2.50573C5.14141 2.26559 5.34684 2.0964 5.57197 1.99816C5.80273 1.89446 6.05882 1.84261 6.34023 1.84261H13.6513C13.944 1.84261 14.2029 1.89446 14.428 1.99816C14.6532 2.0964 14.8558 2.26559 15.0359 2.50573L18.1173 6.51719C18.1849 6.62089 18.2018 6.72186 18.168 6.8201C18.1399 6.91834 18.0498 6.96746 17.8978 6.96746H12.7986C12.5566 6.96746 12.3765 7.04387 12.2583 7.19668C12.1458 7.34404 12.0895 7.51051 12.0895 7.69607V7.75338C12.0895 8.09722 12.0023 8.42468 11.8278 8.73578C11.6589 9.04141 11.4169 9.29247 11.1017 9.48895C10.7922 9.67997 10.4235 9.77548 9.99578 9.77548Z"
              fill="#AEAEAE"
            />
          </svg>{" "}
          <svg
            width="40"
            height="42"
            viewBox="0 0 28 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.33317 11.2857H4.6665V24.1191H9.33317V11.2857Z"
              fill="#AEAEAE"
            />
            <path
              d="M23.3332 15.9524H18.6665V24.1191H23.3332V15.9524Z"
              fill="#AEAEAE"
            />
            <path
              d="M16.3332 5.45239H11.6665V24.1191H16.3332V5.45239Z"
              fill="#AEAEAE"
            />
          </svg>
        </div>
        <div className="user-profile">
          <div className="profile">
            <p>AS</p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="main">
        {/* Main Nav */}
        <div
          className={
            toggleButton
              ? "main-nav light flex items-center justify-between"
              : "main-nav flex items-center justify-between"
          }
        >
          <h2>Onebox</h2>
          <div className="main-nav-right flex items-center">
            <div
              className="toggle-button flex items-center justify-between"
              onClick={() => setToggleButton(!toggleButton)}
            >
              <div
                className={
                  toggleButton
                    ? "toggle-button-inner active"
                    : "toggle-button-inner"
                }
              ></div>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.0275 4.1325C6.8925 4.6125 6.825 5.115 6.825 5.625C6.825 8.685 9.315 11.175 12.375 11.175C12.885 11.175 13.3875 11.1075 13.8675 10.9725C13.0875 12.8925 11.1975 14.25 9 14.25C6.105 14.25 3.75 11.895 3.75 9C3.75 6.8025 5.1075 4.9125 7.0275 4.1325ZM9 2.25C5.2725 2.25 2.25 5.2725 2.25 9C2.25 12.7275 5.2725 15.75 9 15.75C12.7275 15.75 15.75 12.7275 15.75 9C15.75 8.655 15.72 8.31 15.675 7.98C14.94 9.0075 13.74 9.675 12.375 9.675C10.14 9.675 8.325 7.86 8.325 5.625C8.325 4.2675 8.9925 3.06 10.02 2.325C9.69 2.28 9.345 2.25 9 2.25Z"
                  fill="#E8C364"
                />
              </svg>
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 6.81818C10.2 6.81818 11.1818 7.8 11.1818 9C11.1818 10.2 10.2 11.1818 9 11.1818C7.8 11.1818 6.81818 10.2 6.81818 9C6.81818 7.8 7.8 6.81818 9 6.81818ZM9 5.36364C6.99273 5.36364 5.36364 6.99273 5.36364 9C5.36364 11.0073 6.99273 12.6364 9 12.6364C11.0073 12.6364 12.6364 11.0073 12.6364 9C12.6364 6.99273 11.0073 5.36364 9 5.36364ZM1.72727 9.72727H3.18182C3.58182 9.72727 3.90909 9.4 3.90909 9C3.90909 8.6 3.58182 8.27273 3.18182 8.27273H1.72727C1.32727 8.27273 1 8.6 1 9C1 9.4 1.32727 9.72727 1.72727 9.72727ZM14.8182 9.72727H16.2727C16.6727 9.72727 17 9.4 17 9C17 8.6 16.6727 8.27273 16.2727 8.27273H14.8182C14.4182 8.27273 14.0909 8.6 14.0909 9C14.0909 9.4 14.4182 9.72727 14.8182 9.72727ZM8.27273 1.72727V3.18182C8.27273 3.58182 8.6 3.90909 9 3.90909C9.4 3.90909 9.72727 3.58182 9.72727 3.18182V1.72727C9.72727 1.32727 9.4 1 9 1C8.6 1 8.27273 1.32727 8.27273 1.72727ZM8.27273 14.8182V16.2727C8.27273 16.6727 8.6 17 9 17C9.4 17 9.72727 16.6727 9.72727 16.2727V14.8182C9.72727 14.4182 9.4 14.0909 9 14.0909C8.6 14.0909 8.27273 14.4182 8.27273 14.8182ZM4.62909 3.60364C4.34545 3.32 3.88 3.32 3.60364 3.60364C3.32 3.88727 3.32 4.35273 3.60364 4.62909L4.37455 5.4C4.65818 5.68364 5.12364 5.68364 5.4 5.4C5.67636 5.11636 5.68364 4.65091 5.4 4.37455L4.62909 3.60364ZM13.6255 12.6C13.3418 12.3164 12.8764 12.3164 12.6 12.6C12.3164 12.8836 12.3164 13.3491 12.6 13.6255L13.3709 14.3964C13.6545 14.68 14.12 14.68 14.3964 14.3964C14.68 14.1127 14.68 13.6473 14.3964 13.3709L13.6255 12.6ZM14.3964 4.62909C14.68 4.34545 14.68 3.88 14.3964 3.60364C14.1127 3.32 13.6473 3.32 13.3709 3.60364L12.6 4.37455C12.3164 4.65818 12.3164 5.12364 12.6 5.4C12.8836 5.67636 13.3491 5.68364 13.6255 5.4L14.3964 4.62909ZM5.4 13.6255C5.68364 13.3418 5.68364 12.8764 5.4 12.6C5.11636 12.3164 4.65091 12.3164 4.37455 12.6L3.60364 13.3709C3.32 13.6545 3.32 14.12 3.60364 14.3964C3.88727 14.6727 4.35273 14.68 4.62909 14.3964L5.4 13.6255Z"
                  fill="#E8C364"
                />
              </svg>
            </div>
            <button
              className={
                profileDropdown
                  ? "flex items-center rotate"
                  : "flex items-center"
              }
              onClick={() => setProfileDropdown(!profileDropdown)}
            >
              <p>Tim’s Workspace</p>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_1817_3421)">
                  <path
                    d="M2.57844 4.32547L1.39844 5.51214L7.99844 12.1055L14.5984 5.50547L13.4184 4.32547L7.99844 9.74547L2.57844 4.32547V4.32547Z"
                    fill="#454F5B"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1817_3421">
                    <rect
                      width="16"
                      height="16"
                      fill="white"
                      transform="matrix(0 -1 1 0 0 16)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>
        </div>
        <div className="main-inner-container flex">
          <div
            className={`main-left ${toggleButton ? "light" : ""} ${
              sidePanel ? "active" : ""
            }`}
          >
            <div className="main-left-header flex items-start justify-between">
              <div>
                <button className="flex items-center">
                  <p>All Inbox(s)</p>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_1817_3421)">
                      <path
                        d="M2.57844 4.32547L1.39844 5.51214L7.99844 12.1055L14.5984 5.50547L13.4184 4.32547L7.99844 9.74547L2.57844 4.32547V4.32547Z"
                        fill="#4285F4"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_1817_3421">
                        <rect
                          width="16"
                          height="16"
                          fill="white"
                          transform="matrix(0 -1 1 0 0 16)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </button>
                <p className="inbox-selected">
                  <span>25/25</span>Inboxes selected
                </p>
              </div>
              <svg
                width="35"
                height="35"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="refresh-icon"
              >
                <path
                  d="M11.7652 4.23464C10.7985 3.26797 9.47188 2.66797 7.99854 2.66797C5.05187 2.66797 2.67188 5.05464 2.67188 8.0013C2.67188 10.948 5.05187 13.3346 7.99854 13.3346C10.4852 13.3346 12.5585 11.6346 13.1519 9.33464H11.7652C11.2185 10.888 9.73854 12.0013 7.99854 12.0013C5.79187 12.0013 3.99854 10.208 3.99854 8.0013C3.99854 5.79464 5.79187 4.0013 7.99854 4.0013C9.10521 4.0013 10.0919 4.4613 10.8119 5.18797L8.66521 7.33464H13.3319V2.66797L11.7652 4.23464Z"
                  fill="#F6F6F6"
                />
              </svg>
            </div>
            <div className="search-container my-5 flex items-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="search-icon"
              >
                <path
                  d="M14.3516 14.3578C14.2582 14.4497 14.1326 14.5013 14.0016 14.5016C13.8688 14.501 13.7413 14.4496 13.6453 14.3578L10.9453 11.6516C9.80818 12.6067 8.34621 13.0859 6.86431 12.9894C5.38242 12.8928 3.99502 12.2278 2.99147 11.1332C1.98792 10.0386 1.44571 8.59876 1.47792 7.11407C1.51013 5.62938 2.11428 4.21444 3.16436 3.16436C4.21444 2.11428 5.62938 1.51013 7.11407 1.47792C8.59876 1.44571 10.0386 1.98792 11.1332 2.99147C12.2278 3.99502 12.8928 5.38242 12.9894 6.86431C13.0859 8.34621 12.6067 9.80818 11.6516 10.9453L14.3516 13.6453C14.3988 13.6918 14.4363 13.7473 14.4619 13.8085C14.4875 13.8696 14.5007 13.9353 14.5007 14.0016C14.5007 14.0679 14.4875 14.1335 14.4619 14.1947C14.4363 14.2558 14.3988 14.3113 14.3516 14.3578ZM7.25156 12.0016C8.19102 12.0016 9.10939 11.723 9.89052 11.201C10.6717 10.6791 11.2805 9.93726 11.64 9.06931C11.9995 8.20136 12.0936 7.24629 11.9103 6.32488C11.727 5.40347 11.2746 4.5571 10.6103 3.8928C9.94602 3.22851 9.09965 2.77611 8.17824 2.59283C7.25683 2.40955 6.30176 2.50362 5.43382 2.86313C4.56587 3.22265 3.82402 3.83147 3.30208 4.6126C2.78014 5.39374 2.50156 6.3121 2.50156 7.25156C2.50322 8.51083 3.00419 9.71805 3.89463 10.6085C4.78507 11.4989 5.99229 11.9999 7.25156 12.0016Z"
                  fill="white"
                  fillOpacity="0.2"
                />
              </svg>
              <input type="search" name="search" placeholder="Search" />
            </div>
            <div className="filter-container mb-5 flex items-center justify-between">
              <div className="flex items-center">
                <div className="unread-messages-numbers">
                  <p>0</p>
                </div>
                <p>New Replies</p>
              </div>
              <button className="flex items-center">
                <p>Newest</p>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_1817_3421)">
                    <path
                      d="M2.57844 4.32547L1.39844 5.51214L7.99844 12.1055L14.5984 5.50547L13.4184 4.32547L7.99844 9.74547L2.57844 4.32547V4.32547Z"
                      fill="#ffffff"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1817_3421">
                      <rect
                        width="16"
                        height="16"
                        fill="white"
                        transform="matrix(0 -1 1 0 0 16)"
                      />
                    </clipPath>
                  </defs>
                </svg>
              </button>
            </div>
            {data.map((info, index) => (
              <div
                key={index}
                className={`single-message-container ${
                  activeIndex === index ? "active" : ""
                }`}
                onClick={() => {
                  handleClick(index);
                  setSidePanel(!sidePanel);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="sender-name flex items-center">
                    {info.isRead ? (
                      ""
                    ) : (
                      <div className="unread-message-icon"></div>
                    )}
                    <p>{info.fromEmail}</p>
                  </div>
                  <p className="date">{formatDate(info.sentAt)}</p>
                </div>
                <p className="message">I've tried a lot and .</p>
                <div className="button-container mt-3 flex items-center justify-between">
                  <button className="status interested flex items-center">
                    <div className="status-icon"></div>
                    <p>Interested</p>
                  </button>
                  <button className="campaign flex items-center">
                    <svg
                      width="25"
                      height="28"
                      viewBox="0 0 28 29"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M15.7381 23.5C16.0667 23.5 16.3472 23.3754 16.5795 23.1261C16.8118 22.8824 17.0072 22.5567 17.1659 22.1487L22.7664 7.48867C22.8401 7.29603 22.8967 7.11756 22.9364 6.95326C22.9761 6.78895 22.9959 6.63314 22.9959 6.48584C22.9959 6.18555 22.9081 5.94759 22.7324 5.77195C22.5568 5.59065 22.3188 5.5 22.0186 5.5C21.8769 5.5 21.7211 5.52266 21.5511 5.56799C21.3812 5.60765 21.1999 5.66147 21.0072 5.72946L6.29618 11.364C5.92791 11.5057 5.61913 11.6926 5.36983 11.9249C5.12621 12.1572 5.00439 12.4377 5.00439 12.7663C5.00439 13.1686 5.14037 13.466 5.41233 13.6586C5.68428 13.8456 6.02706 14.0014 6.44065 14.1261L10.8514 15.4773C11.146 15.568 11.3925 15.6048 11.5908 15.5878C11.7891 15.5652 11.9931 15.4575 12.2027 15.2649L21.6616 6.49433C21.7183 6.44334 21.7778 6.41785 21.8401 6.41785C21.9081 6.41785 21.9676 6.44051 22.0186 6.48584C22.0639 6.53116 22.0865 6.58782 22.0865 6.65581C22.0865 6.71813 22.0582 6.77762 22.0016 6.83428L13.265 16.3187C13.0837 16.5113 12.9789 16.7096 12.9506 16.9136C12.9279 17.1176 12.9591 17.3697 13.0441 17.67L14.3528 21.9873C14.4831 22.4235 14.6446 22.7833 14.8373 23.0666C15.0299 23.3555 15.3302 23.5 15.7381 23.5Z"
                        fill="#AEAEAE"
                      />
                    </svg>
                    <p>Campaign Name</p>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Main Middle */}
          <div className={toggleButton ? "main-middle light" : "main-middle"}>
            <div className="main-middle-nav flex items-center justify-between">
              <div className="sender-info">
                <h5>{activeSender?.fromName}</h5>
                <p>{activeSender?.fromEmail}</p>
              </div>
              <div className="button-container flex items-center">
                <div className="dropdown-container">
                  <button
                    className="meeting-status-btn completed flex items-center"
                    onClick={() => setDropdown1(!dropdown1)}
                  >
                    <div className="status-icon"></div>
                    <p>Meeting Completed</p>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={dropdown1 ? "rotate" : ""}
                    >
                      <g clipPath="url(#clip0_1817_3421)">
                        <path
                          d="M2.57844 4.32547L1.39844 5.51214L7.99844 12.1055L14.5984 5.50547L13.4184 4.32547L7.99844 9.74547L2.57844 4.32547V4.32547Z"
                          fill="#A9AEB4"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_1817_3421">
                          <rect
                            width="16"
                            height="16"
                            fill="white"
                            transform="matrix(0 -1 1 0 0 16)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                  </button>
                  <ul
                    className={
                      dropdown1 ? "meeting-dropdown active" : "meeting-dropdown"
                    }
                  >
                    <li>
                      <svg
                        width="20"
                        height="21"
                        viewBox="0 0 20 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.6641 6.3335H8.33073V8.00016H16.6641V18.0002H3.33073V8.00016H4.9974V11.3335H6.66406V4.66683H11.6641V1.3335H4.9974V6.3335H3.33073C2.41406 6.3335 1.66406 7.0835 1.66406 8.00016V18.0002C1.66406 18.9168 2.41406 19.6668 3.33073 19.6668H16.6641C17.5807 19.6668 18.3307 18.9168 18.3307 18.0002V8.00016C18.3307 7.0835 17.5807 6.3335 16.6641 6.3335Z"
                          fill="#EBEBEB"
                        />
                      </svg>
                      <p>Mark as unread</p>
                    </li>
                    <li>
                      <svg
                        width="20"
                        height="21"
                        viewBox="0 0 20 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_1_20852)">
                          <path
                            d="M2.5 14.8751V18.0001H5.625L14.8417 8.78345L11.7167 5.65845L2.5 14.8751ZM17.8417 5.78345L14.7167 2.65845L12.6083 4.77511L15.7333 7.90011L17.8417 5.78345Z"
                            fill="#EBEBEB"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_1_20852">
                            <rect
                              width="20"
                              height="20"
                              fill="white"
                              transform="translate(0 0.5)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                      <p>Edit lead</p>
                    </li>
                    <li>
                      <svg
                        width="20"
                        height="21"
                        viewBox="0 0 20 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.25 7.16659C11.25 5.32492 9.75833 3.83325 7.91667 3.83325C6.075 3.83325 4.58333 5.32492 4.58333 7.16659C4.58333 9.00825 6.075 10.4999 7.91667 10.4999C9.75833 10.4999 11.25 9.00825 11.25 7.16659ZM9.58333 7.16659C9.58333 8.08325 8.83333 8.83325 7.91667 8.83325C7 8.83325 6.25 8.08325 6.25 7.16659C6.25 6.24992 7 5.49992 7.91667 5.49992C8.83333 5.49992 9.58333 6.24992 9.58333 7.16659Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M1.25 15.4999V17.1666H14.5833V15.4999C14.5833 13.2833 10.1417 12.1666 7.91667 12.1666C5.69167 12.1666 1.25 13.2833 1.25 15.4999ZM2.91667 15.4999C3.08333 14.9083 5.66667 13.8333 7.91667 13.8333C10.1583 13.8333 12.725 14.8999 12.9167 15.4999H2.91667Z"
                          fill="#EBEBEB"
                        />
                        <path
                          d="M18.75 8.83325H13.75V10.4999H18.75V8.83325Z"
                          fill="#EBEBEB"
                        />
                      </svg>
                      <p>Remove lead</p>
                    </li>
                    <li>
                      <svg
                        width="20"
                        height="21"
                        viewBox="0 0 20 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.9974 2.1665C5.41406 2.1665 1.66406 5.9165 1.66406 10.4998C1.66406 15.0832 5.41406 18.8332 9.9974 18.8332C14.5807 18.8332 18.3307 15.0832 18.3307 10.4998C18.3307 5.9165 14.5807 2.1665 9.9974 2.1665ZM9.9974 17.1665C6.3224 17.1665 3.33073 14.1748 3.33073 10.4998C3.33073 6.82484 6.3224 3.83317 9.9974 3.83317C13.6724 3.83317 16.6641 6.82484 16.6641 10.4998C16.6641 14.1748 13.6724 17.1665 9.9974 17.1665ZM10.4141 6.33317H9.16406V11.3332L13.4974 13.9998L14.1641 12.9165L10.4141 10.6665V6.33317Z"
                          fill="#EBEBEB"
                        />
                      </svg>
                      <p>Set reminder</p>
                    </li>
                    <li onClick={() => setDeleteModal(true)}>
                      <svg
                        width="20"
                        height="21"
                        viewBox="0 0 20 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_1_20865)">
                          <path
                            d="M13.3332 8V16.3333H6.6665V8H13.3332ZM12.0832 3H7.9165L7.08317 3.83333H4.1665V5.5H15.8332V3.83333H12.9165L12.0832 3ZM14.9998 6.33333H4.99984V16.3333C4.99984 17.25 5.74984 18 6.6665 18H13.3332C14.2498 18 14.9998 17.25 14.9998 16.3333V6.33333Z"
                            fill="#DBDBDB"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_1_20865">
                            <rect
                              width="20"
                              height="20"
                              fill="white"
                              transform="translate(0 0.5)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                      <p>Delete</p>
                    </li>
                  </ul>
                </div>
                <div className="dropdown-container">
                  <button
                    className="move-btn flex items-center"
                    onClick={() => setDropdown2(!dropdown2)}
                  >
                    <p>Move</p>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={dropdown2 ? "rotate" : ""}
                    >
                      <g clipPath="url(#clip0_1817_3421)">
                        <path
                          d="M2.57844 4.32547L1.39844 5.51214L7.99844 12.1055L14.5984 5.50547L13.4184 4.32547L7.99844 9.74547L2.57844 4.32547V4.32547Z"
                          fill="#A9AEB4"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_1817_3421">
                          <rect
                            width="16"
                            height="16"
                            fill="white"
                            transform="matrix(0 -1 1 0 0 16)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                  </button>
                  <ul
                    className={
                      dropdown2 ? "move-dropdown active" : "move-dropdown"
                    }
                  >
                    <li>
                      <svg
                        width="20"
                        height="21"
                        viewBox="0 0 20 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M16.6641 6.3335H8.33073V8.00016H16.6641V18.0002H3.33073V8.00016H4.9974V11.3335H6.66406V4.66683H11.6641V1.3335H4.9974V6.3335H3.33073C2.41406 6.3335 1.66406 7.0835 1.66406 8.00016V18.0002C1.66406 18.9168 2.41406 19.6668 3.33073 19.6668H16.6641C17.5807 19.6668 18.3307 18.9168 18.3307 18.0002V8.00016C18.3307 7.0835 17.5807 6.3335 16.6641 6.3335Z"
                          fill="#EBEBEB"
                        />
                      </svg>
                      <p>Mark as unread</p>
                    </li>
                    <li>
                      <svg
                        width="20"
                        height="21"
                        viewBox="0 0 20 21"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_1_20852)">
                          <path
                            d="M2.5 14.8751V18.0001H5.625L14.8417 8.78345L11.7167 5.65845L2.5 14.8751ZM17.8417 5.78345L14.7167 2.65845L12.6083 4.77511L15.7333 7.90011L17.8417 5.78345Z"
                            fill="#EBEBEB"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_1_20852">
                            <rect
                              width="20"
                              height="20"
                              fill="white"
                              transform="translate(0 0.5)"
                            />
                          </clipPath>
                        </defs>
                      </svg>
                      <p>Edit lead</p>
                    </li>
                  </ul>
                </div>
                <button className="more-btn">
                  <svg
                    width="12"
                    height="3"
                    viewBox="0 0 12 3"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.0013 0.167969C1.26797 0.167969 0.667969 0.767969 0.667969 1.5013C0.667969 2.23464 1.26797 2.83464 2.0013 2.83464C2.73464 2.83464 3.33464 2.23464 3.33464 1.5013C3.33464 0.767969 2.73464 0.167969 2.0013 0.167969ZM10.0013 0.167969C9.26797 0.167969 8.66797 0.767969 8.66797 1.5013C8.66797 2.23464 9.26797 2.83464 10.0013 2.83464C10.7346 2.83464 11.3346 2.23464 11.3346 1.5013C11.3346 0.767969 10.7346 0.167969 10.0013 0.167969ZM6.0013 0.167969C5.26797 0.167969 4.66797 0.767969 4.66797 1.5013C4.66797 2.23464 5.26797 2.83464 6.0013 2.83464C6.73464 2.83464 7.33464 2.23464 7.33464 1.5013C7.33464 0.767969 6.73464 0.167969 6.0013 0.167969Z"
                      fill="#D9D9D9"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="message-container p-4">
              <div className="message-date mt-4 flex items-center justify-center">
                <hr />
                <p>{formatDate(activeSender?.sentAt)}</p>
                <hr />
              </div>
              <div className="message-box my-5">
                <div className="flex items-center justify-between">
                  <p className="subject">{activeSender?.subject}</p>
                  <p className="date">
                    {secondDateFormate(activeSender?.sentAt)}
                  </p>
                </div>
                <p className="message-from">
                  from : {activeSender?.fromEmail} cc : {activeSender?.cc}
                </p>
                <p className="message-to">to : {activeSender?.toEmail} </p>
                <p
                  className="message"
                  dangerouslySetInnerHTML={{ __html: activeSender?.body }}
                />
              </div>
              <div className="message-date mt-4 flex items-center justify-center">
                <hr />
                <p>
                  <span>
                    <svg
                      width="17"
                      height="16"
                      viewBox="0 0 11 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10.3617 10.8H0.761719V12H10.3617V10.8Z"
                        fill="#AEAEAE"
                      />
                      <path
                        d="M10.3617 0H0.761719V1.2H10.3617V0Z"
                        fill="#AEAEAE"
                      />
                      <path
                        d="M4.00772 6.954L3.16172 7.8L5.56172 10.2L7.96172 7.8L7.11572 6.954L6.16172 7.902V4.098L7.11572 5.046L7.96172 4.2L5.56172 1.8L3.16172 4.2L4.00772 5.046L4.96172 4.098V7.902L4.00772 6.954Z"
                        fill="#AEAEAE"
                      />
                    </svg>
                  </span>
                  View all 4 replies
                </p>
                <hr />
              </div>
            </div>
            <button
              className="reply-btn flex items-center justify-center"
              onClick={() => setReplyBox(true)}
            >
              <img src={reply} width="25px" alt="Reply icon" />
              <p>Reply</p>
            </button>

            <div
              className={`main-middle-modal ${replyBox ? "active" : ""} ${
                toggleButton ? "light" : ""
              }`}
            >
              <div className="header flex items-center justify-between">
                <p>Reply</p>
                {toggleButton ? (
                  <img
                    src={close2}
                    width="35px"
                    alt="Close icon"
                    className="close-icon"
                    onClick={() => setReplyBox(false)}
                  />
                ) : (
                  <img
                    src={close}
                    width="35px"
                    alt="Close icon"
                    className="close-icon"
                    onClick={() => setReplyBox(false)}
                  />
                )}
              </div>
              <div className="to-container flex items-center">
                <p>To:</p>
                <input
                  type="email"
                  name="to-email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
              <div className="from-container flex items-center">
                <p>From:</p>
                <input
                  type="email"
                  name="from-email"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="subject-container flex items-center">
                <p>Subject: </p>
                <input
                  type="text"
                  name="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="editor">
                <Editor
                  editorState={editorState}
                  handleKeyCommand={handleKeyCommand}
                  onChange={(state) => setEditorState(state)}
                />
              </div>
              <div className="modal-footer flex items-center">
                <button
                  className="send-btn flex items-center"
                  onClick={() => handleSubmit(activeSender.threadId)}
                >
                  <p>Send</p>
                  <img src={arrowDown} width="10px" alt="Arrow down Icon" />
                </button>
                <button
                  className="draft-btn flex items-center"
                  onClick={handleSave}
                >
                  <img src={saveDraft} width="25px" alt="Draft icon" />
                  <p>Save draft</p>
                </button>
                <img
                  src={bold}
                  width="25px"
                  className="bold"
                  alt="Bold icon"
                  onClick={() => toggleInlineStyle("BOLD")}
                />
                <img
                  src={italic}
                  width="25px"
                  className="italic"
                  alt="Italic icon"
                  onClick={() => toggleInlineStyle("ITALIC")}
                />
              </div>
            </div>
          </div>

          {/* Main Right */}
          <div className={toggleButton ? "main-right light" : "main-right"}>
            <div className="heading text-left my-5">
              <h5>Lead Details</h5>
            </div>
            <div className="user-info my-5">
              <div className="flex items-center justify-between">
                <p>Name </p>
                <p>{activeSender?.fromName}</p>
              </div>
              <div className="flex items-center justify-between">
                <p>Contact No </p>
                <p>+54-9062827869</p>
              </div>
              <div className="flex items-center justify-between">
                <p>Email ID</p>
                <p>{activeSender?.fromEmail}</p>
              </div>
              <div className="flex items-center justify-between">
                <p>Linkedin</p>
                <p>linkedin.com/in/timvadde/</p>
              </div>
              <div className="flex items-center justify-between">
                <p>Company Name</p>
                <p>Reachinbox</p>
              </div>
            </div>
            <div className="heading text-left my-5">
              <h5>Activities</h5>
            </div>
            <div className="mx-4">
              <h5>Campaign Name</h5>
              <div className="steps-heading my-3 flex items-center">
                <p>
                  <span>3</span> Steps
                </p>
                <p>
                  <span>5</span> Days in Sequence
                </p>
              </div>
              <div className="steps-container">
                <div className="vertical-line"></div>
                <div className="steps flex items-center justify-start">
                  <div className="icon">
                    <img src={mail} width="30px" alt="Envelop icon" />
                  </div>
                  <div>
                    <p className="steps-heading">Step 1: Email</p>
                    <div className="flex items-center">
                      <img src={send} width="25px" alt="Send icon" />
                      <p className="steps-date">
                        Sent <span>3rd, Feb</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="steps flex items-center justify-start">
                  <div className="icon">
                    <img src={mail} width="30px" alt="Envelop icon" />
                  </div>
                  <div>
                    <p className="steps-heading">Step 2: Email</p>
                    <div className="flex items-center">
                      <img src={draft} width="20px" alt="Send icon" />
                      <p className="steps-date">
                        Opened <span>5th, Feb</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="steps flex items-center justify-start">
                  <div className="icon">
                    <img src={mail} width="30px" alt="Envelop icon" />
                  </div>
                  <div>
                    <p className="steps-heading">Step 3: Email</p>
                    <div className="flex items-center">
                      <img src={draft} width="20px" alt="Send icon" />
                      <p className="steps-date">
                        Opened <span>5th, Feb</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={deleteModal ? "modal-container active" : "modal-container"}
      >
        <div className="delete-modal">
          <h2>Are you sure ?</h2>
          <p>Your selected email will be deleted.</p>
          <div className="flex items-center justify-between">
            <button onClick={() => setDeleteModal(false)}>Cancel</button>
            <button>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Onebox;
