import express from 'express';
import { authMiddleware } from '../middlware/Security-auth';
import { allUser, findingUserId, updatingUserInfo } from '../dao/user-query';
import { findingUser } from '../dao/user-query';
import { reverseconvertSqlUser, numberSqlUser } from '../util/sql-user-converter';

export const userRouter = express.Router();

userRouter.get('', [authMiddleware(['Admin', 'Finance Manager']), async (req, res) => {
    console.log('Testing if this even works');
    const alluser = await allUser();
    console.log(alluser);
    res.json(alluser);
}]);


// Restricted User ID find. Only User with the correct ID can get their own information
userRouter.get('/:id', [authMiddleware(['Admin', 'Finance Manager', 'Employee']), async (req, res) => {
        const user_id  = +req.params.id;
        const user = await findingUserId(user_id);
         if (req.session.user.userId === user_id) {
            res.json(user);
        }
        else if (user.role.role === 'Admin' || user.role.role === 'Finance Manager') {
            res.josn(user);
        } else {
            res.send('You do not have permission to view other people id' + 404);
        }

}]);

// Logging in System
userRouter.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const user = await findingUser(username, password);

    if (user) {
        req.session.user = user;
        console.log(`Username: ${username} has been accepted`);
        console.log('Password: * has been accepted');
        res.json(user);
    } else {
        console.log(`Username: ${username} has been denied`);
        console.log('Password: * has been denied');
        res.sendStatus(401);
    }
});

// Updating the user.
userRouter.patch('', [authMiddleware(['Admin']), async (req, res) => {
    const { body } = req; // Destructuring
    if (!body.userId) {
        console.log(body.userId);
        res.send('UserId does not exist');
    } else {
    const convertedSqlUser = reverseconvertSqlUser(body);
    const user = await findingUserId(body.userId);
    const bodyname = numberSqlUser( Object.keys(body));
    const conbodyname = Object.entries(convertedSqlUser);

    const bodyvalue = [];
        for (const field in user ) {
            if (body[field] !== undefined) {
                user[field] = body[field];
                bodyvalue.push(user[field]);
            }
            if (bodyname[field] === conbodyname[field]) {
                // test
            }
        }
        updatingUserInfo(bodyname, bodyvalue, body.userId);
    }
}]);