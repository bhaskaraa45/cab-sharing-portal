import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import UserTravellers from "../rootUserSpecific/UserTravellers";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import toastError from "components/utils/toastError";
import logout from "components/utils/logout";

// Traveller card in user bookings

const TravellerCard = ({
  userSpecific,
  bookingData,
  username,
  email,
  index,
  fetchUserBookings,
}) => {
  const router = useRouter();

  const [expand, setExpand] = useState(false);
  const [user_email, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (index === 0) setExpand(true);
    setUserEmail(localStorage.getItem("user_email"));
  }, []);

  const ExitBooking = async () => {
    try {
      setLoading(true);  
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings/${bookingData?.id}/self`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
  
      toast("Successfully exited cab", { type: "success" });
      fetchUserBookings();
    } catch (err) {
      console.log(err);
      toastError(err.response?.data?.detail || "Error exiting cab");
      if (err.response?.status === 401) {
        await logout(router);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div
      tabIndex={0}
      className={`collapse collapse-arrow ${
        index === 0 && expand && "collapse-open"
      }  ${
        expand ? "collapse-open" : "collapse-close"
      } collapse-close bg-secondary/10 px-2  md:p-5 py-2 sm:py-0 sm:mx-auto sm:mt-5 border-t-2 border-black/20 sm:border-2 sm:three-d sm:shadow-md sm:border-black text-black  rounded-none sm:rounded-md w-[100vw] sm:w-[90vw] lg:w-[60rem]`}
      onClick={() => setExpand((prev) => !prev)}
    >
      <div className="collapse-title p-1 md:p-2 font-medium flex flex-col  rounded-md  cursor-pointer">
        <div className="flex flex-row justify-normal mt-2 gap-2 md:gap-10 ">
          <p className=" tracking-wider text-[.9rem] md:text-[1rem] truncate">
            <BoldedHeading text="From:" /> {bookingData.from_}
          </p>

          <p className="tracking-wider text-[.9rem] md:text-[1rem] truncate">
            <BoldedHeading text="To:" /> {bookingData.to}
          </p>

          <div className="hidden 5x:inline">
            <p className=" tracking-wider text-[.9rem] md:text-[1rem] truncate">
              <BoldedHeading text="Occupied:" />{" "}
              {bookingData.travellers?.length}/{bookingData.capacity}
            </p>
          </div>
        </div>
        <div className="5x:hidden inline mt-2">
          <p className=" tracking-wider text-[.9rem] md:text-[1rem] truncate">
            <BoldedHeading text="Occupied:" /> {bookingData.travellers?.length}/
            {bookingData.capacity}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row  mt-5 sm:mt-4 sm:items-start justify-start items-start gap-3  w-[22rem]  sm:w-[30rem] md:w-[35rem]">
          <div className="flex flex-col md:gap-3 md:flex-row items-start bg-white/30 p-2 rounded-md w-full ">
            <BoldedHeading text="Leaving window" />
            <span className="hidden md:block">-</span>
            <p className="flex flex-row items-center justify-center tracking-wider text-[.9rem] md:text-[1rem]">
              <span className="mt-[3px]">
                {new Date(bookingData.start_time).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  weekday: "short",
                }) +
                  " " +
                  new Date(bookingData.start_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) +
                  " - " +
                  new Date(bookingData.end_time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </span>
            </p>
          </div>
        </div>
      </div>
      <div
        className="collapse-content p-1 md:p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col justify-center mt-8">
          <div className="break-words text-[.8rem] sm:text-[.9rem]">
            <span className="text-secondary text-[.9rem] md:text-[1rem]">
              Note:
            </span>{" "}
            {bookingData.travellers[0].comments}
          </div>
        </div>

        {bookingData.travellers.length > 0 && (
          <UserTravellers
            travellers={bookingData.travellers}
            user_email={user_email}
            ExitBooking={ExitBooking}
            owner_email={bookingData.owner_email}
          />
        )}
      </div>
    </div>
  );
};

const BoldedHeading = ({ text }) => (
  <span className=" text-secondary font-semibold  tracking-wider text-[.9rem] md:text-[1.15rem]">
    {text}
  </span>
);
export default TravellerCard;
