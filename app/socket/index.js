'use strict';
const helper = require('../helpers');

module.exports = (io, app) => {
    let allrooms = app.locals.chatrooms;

    io.of('/roomslist').on('connection', socket => {

        socket.on('getChatrooms', () => {
            socket.emit('chatRoomsList', JSON.stringify(allrooms));
        });

        socket.on('createNewRoom', newRoomInput => {
            // check to see if a room with the same title exist or not
            // if not, create one and broadcast it to everyone.

            if (!helper.findRoomByName(allrooms, newRoomInput)) {
                allrooms.push({
                    room: newRoomInput,
                    roomID: helper.randomHex(),
                    users: []
                });

                //EMIT an updated list to the creator.
                socket.emit('chatRoomsList', JSON.stringify(allrooms));
                // Emit an updated list to everyone connected to the rooms page.
                socket.broadcast.emit('chatRoomsList', JSON.stringify(allrooms));
            }
        })
    });

    io.of('/chatter').on('connection', socket => {

        //join a chatrooms
        socket.on('joinRoom', data => {
            let usersList = helper.addUserToRoom(allrooms, data, socket);

            //Update the list of active users as shown on the chatroom
            socket.broadcast.to(data.roomID).emit('updateUserList', JSON.stringify(usersList.users));

            //who joined now
            socket.emit('updateUserList', JSON.stringify(usersList.users));
        });

        //when a socket exists
        socket.on('disconnect', () => {
            //Find the room, to which the socket is connected to and purge the user.
            let room = helper.removeUserFromRoom(allrooms, socket);
            socket.broadcast.to(room.roomID).emit('updateUserList', JSON.stringify(room.users));
        });

        //when a new message arrives.
        socket.on('newMessage', data => {
            socket.to(data.roomID).emit('inMessage', JSON.stringify(data));
        });

    });
}
