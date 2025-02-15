import React from "react";
import { useRouter } from "next/router";
import { Logout } from "@mui/icons-material";
import logout from "components/utils/logout";

function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {

    await logout(router)
    // localStorage.removeItem("user_name");
    // localStorage.removeItem("user_email");
    // localStorage.removeItem("user_pic_url");
    // // localStorage.removeItem("credential");

    // router.push("/");
  };

  return (
    <button
      className="btn bg-transparent h-1 min-h-8 p-1 border-none text-black mx-5 mb-5 hover:bg-secondary/80 hover:text-white/80 capitalize font-[400]  text-sm my-3 transition-all hover:-translate-y-[.5px] ml-[auto]"
      onClick={handleLogout}
    >
      Logout <Logout className="text-[.9rem] text-black/50" />
    </button>
  );
}

export default LogoutButton;
