const trimStr = (str) => str.trim().toLowerCase();

let allUsers = [];

const isExistUser = (userToJoin) => {
  const userName = trimStr(userToJoin.userName);
  const userRoom = trimStr(userToJoin.room);

  return allUsers.find(
    (u) => trimStr(u.userName) === userName && trimStr(u.room) === userRoom
  );
};

const addUser = (userToJoin) => {
  const isExist = isExistUser(userToJoin);

  !isExist && allUsers.push(userToJoin);

  const currentUser = isExist || userToJoin;

  return { isExist: !!isExist, currentUser: currentUser };
};

const getRoomUsers = (currentRoom) =>
  allUsers.filter((u) => u.room === currentRoom);

const removeUser = (activeUser) => {
  const isExist = isExistUser(activeUser);

  if (isExist) {
    allUsers = allUsers.filter(
      (user) => user.room === isExist.room && user.userName !== isExist.userName
    );
  }

  return isExist;
};

console.log("allUsers", allUsers);

module.exports = { addUser, isExistUser, getRoomUsers, removeUser };
