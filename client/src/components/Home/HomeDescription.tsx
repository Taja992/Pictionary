


interface HomeDescriptionProps {
  text: string;
}

export default function HomeDescription({ text }: HomeDescriptionProps) {
  return <p className="home-description">{text}</p>;
}