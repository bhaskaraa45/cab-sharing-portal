import { TextField } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import UserTravellers from "./views/CabSharing/UserTravellers";
import { comment } from "postcss";
import { MuiTelInput, matchIsValidTel } from "mui-tel-input";
import retrieveAuthToken from "./utils/retrieveAuthToken";
import { useRouter } from "next/router";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PhoneNumberModal from "./views/CabSharing/PhoneNumberModal";

const AllUserCardExpanded = ({ bookingData, email, fetchFilteredBookings }) => {
  const [isValidToJoin, setIsValidToJoin] = useState(false);
  const [joinComment, setJoinComment] = useState("I am interested to join.");

  const [loaded_phone, setLoadedPhone] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneIsValid, setPhoneIsValid] = useState(false);
  const [is_there_a_phone_number, setIsThereAPhoneNumber] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const authToken = retrieveAuthToken(router);
    let apiURL = `http://localhost:8000/me`;
    axios
      .get(apiURL, {
        headers: {
          Authorization: authToken,
        },
      })
      .then((data) => {
        if (
          data.data["phone_number"] == null ||
          data.data["phone_number"] == ""
        ) {
          setPhone("");
          setLoadedPhone("");
          setIsThereAPhoneNumber(false);
        } else {
          setPhone(data.data["phone_number"]);
          setLoadedPhone(data.data["phone_number"]);
          setIsThereAPhoneNumber(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // handlers
  const JoinBooking = async () => {
    const authToken = retrieveAuthToken(router);
    if (phone != loaded_phone) {
      let apiURL = `http://localhost:8000/me`;
      await axios
        .post(
          apiURL,
          JSON.stringify({
            phone_number: phone,
          }),
          {
            headers: {
              Authorization: authToken,
              "Content-Type": "application/json",
            },
          }
        )
        .catch((err) => {
          console.log(err);
        });
    }
    try {
      const data = await axios.post(
        `http://localhost:8000/bookings/${bookingData.id}/request`,
        { comments: joinComment },
        {
          headers: {
            Authorization: authToken,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(
        `successfully requested the user booking of id ${bookingData?.id}`
      );
      toast("Successfully Requested");
    } catch (err) {
      console.log(err);
    } finally {
      fetchFilteredBookings();
    }
  };

  const handlePhoneEdit = async () => {
    if (phone != loaded_phone) {
      const authToken = retrieveAuthToken(router);
      let apiURL = `http://localhost:8000/me`;
      await axios
        .post(
          apiURL,
          JSON.stringify({
            phone_number: phone,
          }),
          {
            headers: {
              Authorization: authToken,
              "Content-Type": "application/json",
            },
          }
        )
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const travellers_email_list = [];
  bookingData.travellers.map((item) => travellers_email_list.push(item.email));

  const request_email_list = [];
  bookingData.requests?.map((item) => request_email_list.push(item.email));

  const isInRequest = request_email_list.indexOf(email);
  let ownerIndex = 0;

  const handlePhoneChange = (value, info) => {
    setPhone(info.numberValue);
    setPhoneIsValid(matchIsValidTel(info.numberValue));
  };

  useEffect(() => {
    if (travellers_email_list.indexOf(email) === -1 && isInRequest === -1)
      setIsValidToJoin(true);
    else ownerIndex = travellers_email_list.indexOf(email);
  }, []);

  return (
    <div onClick={(e) => e.stopPropagation()} className="mt-5">
      <div className="flex flex-col justify-center my-5">
        <div className="flex flex-col sm:flex-row justify-center items-center mr-auto sm:gap-3">
          <h3 className=" tracking-widest text-[1rem] sm:text-[1.15rem]">
            {bookingData.travellers[0].name}
          </h3>
          <p className="text-primary tracking-wider font-medium text-[.9rem] sm:text-[1.1rem] mr-auto ">
            {bookingData.travellers[0].email}
          </p>
        </div>
        <div>
          <span className="text-primary text-[.9rem] sm:text-[1.1rem] ">
            Note:
          </span>{" "}
          {bookingData.travellers[0].comments}
        </div>
      </div>
      {
        <div className="flex flex-row justify-between items-center">
          {isValidToJoin && isInRequest == -1 ? (
            <input
              disabled={!isValidToJoin}
              onClick={(e) => e.stopPropagation()}
              value={joinComment}
              name="comment"
              onChange={(e) => setJoinComment(e.target.value)}
              className="bg-transparent w-[60%] txt-black text-[.8rem] sm:text-[1.1rem] py-3 pl-2 rounded-sm border-b border-white"
            />
          ) : (
            <p></p>
          )}
          <div>
            {isValidToJoin && isInRequest == -1 && is_there_a_phone_number && (
              <button
                disabled={
                  joinComment.length == 0 || phone.replace("+91", "") == ""
                }
                className="btn btn-outline"
                onClick={JoinBooking}
              >
                Join Booking
              </button>
            )}
            {!is_there_a_phone_number && (
              <PhoneNumberModal
                handlePhoneEdit={handlePhoneEdit}
                handlePhoneChange={handlePhoneChange}
                phone={phone}
                phoneIsValid={phoneIsValid}
              />
            )}

            {isInRequest != -1 && (
              <button disabled={true} className="btn btn-outline">
                Request Pending
              </button>
            )}
          </div>
        </div>
      }

      <div className="mt-5">
        {bookingData.travellers.length > 0 && (
          <UserTravellers
            travellers={bookingData.travellers}
            hidePhoneNumber={true}
          />
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default AllUserCardExpanded;
