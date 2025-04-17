import { useNavigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { ROUTES } from '../routes';
import { userAtom, navigationStateAtom } from '../atoms';
import {
  HomeContainer,
  HomeTitle,
  HomeDescription,
  NameForm
} from '../components/Home';
import '../components/home/home.css';

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useAtom(userAtom);
  const [navState, setNavState] = useAtom(navigationStateAtom);
  
  const handleSubmit = (playerName: string) => {
    // Save the name to localStorage
    localStorage.setItem('playerName', playerName);
    
    // Update user atom with name
    setUser({
      ...user,
      name: playerName
    });
    
    // Update navigation state
    setNavState({
      previousRoute: navState.currentRoute,
      currentRoute: ROUTES.ROOMS
    });
    
    navigate(ROUTES.ROOMS);
  };
  
  return (
    <HomeContainer>
      <HomeTitle title="Pictionary Online" />
      <HomeDescription 
        text="Draw, guess, and have fun with friends in this multiplayer drawing and guessing game!"
      />
      <NameForm onSubmit={handleSubmit} />
    </HomeContainer>
  );
}