//Just testing with this to confirm that react is working properly
import React, { useState } from 'react';

type Props = {
  name?: string;
  other?: string;
}

const App2: React.FC<Props> = (props)  => {
  //Syntax for state is const [state, setState] = useState(initialState);
  const [name, setName] = useState(props.name);

  const changeNameToGreet = (event: any) => {
      setName(event.target.value);
  }

  return (
      <div>
          <p>Hello {name}. Greetings from React.</p> 
          <p>
              <input type="text" placeholder="Write a name here..." name="name_to_greet" onInput={changeNameToGreet}/>
          </p>
      </div>
  )

}

App2.defaultProps = {
  name: "John"
} 


export default App2;
