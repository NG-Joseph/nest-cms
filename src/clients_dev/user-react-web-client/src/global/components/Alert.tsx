import React from 'react';
import { Notification, Button } from 'react-bulma-components';

type Props = {
    message: string,
    type: "info" | "success" | "link" | "primary" | "warning" | "danger" | "light" | "dark" | "white" | "black" | undefined,
    onClickHandler: ()=>void
    
}

const Alert: React.FC<Props> = ({message, type, onClickHandler}) => {
    //For bulma notification documentation see https://bulma.io/documentation/elements/notification/
    return(
        <Notification color={type} onClick={onClickHandler}>
          {message}
            <Button remove />
        </Notification>
    )
}

export default Alert