const data = async ({ $auth, redirect }) => {
  const { user_type, role } = $auth.user;
  redirect("/dashboard2");
  return "";
};

export default data;
