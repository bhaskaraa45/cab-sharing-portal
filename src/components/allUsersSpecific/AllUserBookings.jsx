import {
  Autocomplete,
  TextField,
  FormControlLabel,
  FormGroup,
  Switch,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useEffect, useState } from "react";
import CabShareSmall from "components/commonForAll/CabShareSmall";
import { DateTimePicker } from "@mui/x-date-pickers";
import { useRouter } from "next/router";
import axios from "axios";
import logout from "components/utils/logout";
import toastError from "components/utils/toastError";
import UserbookingShimmer from "components/commonForAll/UserbookingShimmer";
import { useMediaQuery } from '@mui/material';


import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const places = [
  "IITH",
  "RGIA",
  "Secun. Railway Stn.",
  "Lingampally Stn.",
  "Kacheguda Stn.",
  "Hyd. Deccan Stn.",
];

const AllUserBookings = () => {
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [fromValue, setFromValue] = useState(null);
  const [toValue, setToValue] = useState(null);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [show_all, setShowAll] = useState(false);
  const [checked, setChecked] = useState(false);
  const [request_checked, setRequestChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // for clearing filters
  const [clickClearFilter, setClickClearFilter] = useState(false);

  const [expand, setExpand] = useState(false);

  const [phone, setPhone] = useState("");
  const [loaded_phone, setLoadedPhone] = useState("");
  const [is_there_a_phone_number, setIsThereAPhoneNumber] = useState(true);

  // responsive ness for the switch 
  const isLargeScreen = useMediaQuery('(min-width: 430px)');
  
  const fetchFilteredBookings = async () => {
      setIsLoading(true);
      let apiURL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/bookings`;
  
      const isoStartTime = startTime?.toISOString();
      const isoEndTime = endTime?.toISOString();
      
      const fromToQuery = fromValue && toValue ? `from_loc=${fromValue}&to_loc=${toValue}` : '';
      const timeQuery = isoStartTime && isoEndTime ? `start_time=${isoStartTime}&end_time=${isoEndTime}`
                      : isoStartTime ? `start_time=${isoStartTime}`
                      : isoEndTime ? `end_time=${isoEndTime}`
                      : '';
  
      const queryString = [fromToQuery, timeQuery].filter(Boolean).join('&');
      
      if (queryString) {
          apiURL += `?${queryString}`;
      }
  
      try {
          const response = await axios.get(apiURL, {
              headers: {
                  "Content-Type": "application/json"
              },
              withCredentials: true
          });
          setFilteredBookings(response.data);
      } catch (error) {
          if (error.response) {
            if (error.response.status === 401) {
              await logout(router);
              return;
            }
            toastError(error.response.data.detail);
          } else {
              // toastError("Error fetching filtered bookings");
          }
          console.error("Error fetching filtered bookings:", error);
      } finally {
          setIsLoading(false);
      }
  };
  

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 10);

  const getMe = async () => {
    try {
        const { data } = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/me`,
            {
                withCredentials: true,
            }
        );

        if (!data.phone_number) {
            setPhone("");
            setLoadedPhone("");
            setIsThereAPhoneNumber(false);
        } else {
            setPhone(data.phone_number);
            setLoadedPhone(data.phone_number);
            setIsThereAPhoneNumber(true);
        }
    } catch (err) {
        console.error(err);
        if (err.response) {
          if (err.response.status === 401) {
            await logout(router);
            return;
          }
          toastError(err.response.data.detail);
        } else {
            // toastError("Error fetching user data");
        }
    }
};

  useEffect(() => {
    if (
      endTime === null &&
      startTime === null &&
      toValue === null &&
      fromValue === null
    ) {
      fetchFilteredBookings();
    }
  }, [endTime, startTime, toValue, fromValue, clickClearFilter]);

  const clearFilters = () => {
    setEndTime(null);
    setStartTime(null);
    setToValue(null);
    setFromValue(null);
    setClickClearFilter((prev) => !prev);
  };

  useEffect(() => {
    setUsername(localStorage.getItem("user_name"));
    setEmail(localStorage.getItem("user_email"));
    getMe();
  }, []);

  useEffect(() => {
    if (username && email) {
      fetchFilteredBookings().then(() => {
        setIsLoading(false);
      });
    }
  }, [username, email]);

  const handleShowAll = (event) => {
    setShowAll(!show_all);
    setChecked(event.target.checked);
  };

  const fetchRequests = async () => {
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/me/requests`,
        {
          // headers: {
          //   Authorization: authToken,
          // },
          withCredentials: true,
        }
      )
      setFilteredBookings(response.data);
      setIsLoading(false);
    } catch (error) {
      toastError(error.response.data.detail);

      if (error.response.status === 401) {
        await logout(router);
        return;
      }
      console.error("Error fetching requests:", error);
      toastError("Error fetching requests");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (request_checked) {
      fetchRequests();
    } else {
      fetchFilteredBookings();
    }
  }, [request_checked]);

  const handleRequests = (event) => {
    setRequestChecked(event.target.checked);
  };

  return (
    <div className="flex flex-col  rounded-box sm:py-10 mx-auto">
      {isLoading ? (
        <UserbookingShimmer />
      ) : (
        <div>
          <div
            tabIndex={0}
            className={` bg-secondary/10  md:p-5 sm:mx-auto mt-3 border-t-2 border-black/20 sm:border-2 sm:three-d sm:shadow-md sm:border-black text-black rounded-none sm:rounded-md w-[100vw] sm:w-[90vw] lg:w-[60rem]`}
          >
            <div className="collapse-title p-2 font-medium flex flex-col  rounded-md w-[100vw] sm:w-full">
              <div className="flex flex-row justify-between mx-auto gap-2 items-center rounded-md w-full ">
                <div className="flex flex-col 4.1x:flex-row sm:gap-2 ml-auto 4x:mx-auto sm:mr-auto sm:ml-0">
                  <FormGroup
                    sx={{
                      width: "200px",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    <FormControlLabel
                      sx={{
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.05)",
                        },
                        label: {
                          margin: 0,
                          padding: 0,
                        },
                      }}
                      control={
                        <Switch
                          color="secondary"
                          checked={checked}
                          onChange={handleShowAll}
                        />
                      }
                      label="Include filled cabs"
                    />
                  </FormGroup>

                  <FormGroup
                    sx={{
                      width: "200px",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    <FormControlLabel
                      sx={{
                        color: "black",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.05)",
                        },
                        label: {
                          margin: 0,
                          padding: 0,
                        },
                      }}
                      control={
                        <Switch
                          color="secondary"
                          checked={request_checked}
                          onChange={handleRequests}
                        />
                      }
                      label="Pending requests"
                    />
                  </FormGroup>
                </div>

                <div className="ml-auto">
                  {(startTime !== null ||
                    endTime !== null ||
                    toValue !== null ||
                    fromValue !== null) &&
                    expand && (
                      <button
                        className="btn hidden sm:block bg-secondary/70 text-white/80 hover:bg-secondary/80 capitalize font-[400] text-lg my-3 transition-all hover:-translate-y-[0.5px]"
                        onClick={() => {
                          clearFilters();
                          // fetchFilteredBookings();
                        }}
                      >
                        Clear
                      </button>
                    )}
                </div>
              </div>
            </div>

            <div className=" p-0 w-[100vw] sm:w-full">
              <p className="text-[.9rem] md:text-[1rem] text-center mx-auto sm:mr-auto sm:ml-0  w-fit mt-2 mb-5">
                Filter based on times,
                locations or both <br />
              </p>
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex flex-col  4x:flex-row gap-2 items-center mx-auto sm:mr-auto sm:ml-0 lg:m-0">
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    options={places}
                    value={fromValue}
                    onChange={(event, newValue) => {
                      setFromValue(newValue);
                    }}
                    sx={{
                      width: "180px",
                      borderRadius: "8px",
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="From" />
                    )}
                  />
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    options={places}
                    value={toValue}
                    onChange={(event, newValue) => {
                      setToValue(newValue);
                    }}
                    sx={{
                      width: "180px",
                      borderRadius: "8px",
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="To" />
                    )}
                  />
                </div>
                <div className="flex flex-col 4x:flex-row gap-2 items-center mx-auto sm:mr-auto sm:ml-0">
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="Start Time"
                      value={startTime}
                      minDate={new Date()}
                      maxDate={maxDate}
                      onChange={(newValue) => {
                        setStartTime(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          sx={{
                            width: "180px",
                            borderRadius: "8px",
                          }}
                          {...params}
                        />
                      )}
                      inputFormat="dd/MM/yyyy HH:mm"
                      ampm={false}
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DateTimePicker
                      label="End Time"
                      value={endTime}
                      minDate={new Date()}
                      maxDate={maxDate}
                      onChange={(newValue) => {
                        setEndTime(newValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          sx={{
                            width: "180px",
                            borderRadius: "8px",
                          }}
                          {...params}
                        />
                      )}
                      inputFormat="dd/MM/yyyy HH:mm"
                      ampm={false}
                    />
                  </LocalizationProvider>
                </div>
              </div>
              <div className="flex gap-2 justify-center sm:justify-end">
                {(startTime !== null ||
                  endTime !== null ||
                  toValue !== null ||
                  fromValue !== null) && (
                    <button
                      className="btn block  bg-secondary/70 text-white/80 hover:bg-secondary/80 capitalize font-[400] text-lg my-3 transition-all hover:-translate-y-[0.5px]"
                      onClick={() => {
                        clearFilters();
                        fetchFilteredBookings();
                      }}
                    >
                      Clear
                    </button>
                  )}

                <button
                  onClick={fetchFilteredBookings}
                  className=" btn bg-secondary/70  text-white/80 hover:bg-secondary/80 capitalize font-[400] text-lg my-3 transition-all hover:-translate-y-[.5px] disabled:bg-gray-300 disabled:text-gray-400"
                  disabled={
                    (toValue != null &&
                      fromValue === null) ||
                    (toValue === null &&
                      fromValue != null) ||
                    (startTime === null &&
                      endTime === null &&
                      toValue === null &&
                      fromValue === null)
                  }
                >
                  Search
                </button>
              </div>
            </div>
          </div>
          <div className="sm:my-10">
            {filteredBookings?.map((item, index) => {
              if (show_all || item.capacity > item.travellers.length) {
                return (
                  <CabShareSmall
                    fetchFilteredBookings={fetchFilteredBookings}
                    userSpecific={false}
                    key={index}
                    index={index}
                    bookingData={item}
                    username={username}
                    email={email}
                    phone={phone}
                    loaded_phone={loaded_phone}
                    is_there_a_phone_number={is_there_a_phone_number}
                    setIsThereAPhoneNumber={setIsThereAPhoneNumber}
                    setPhone={setPhone}
                    setLoadedPhone={setLoadedPhone}
                  />
                );
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUserBookings;
