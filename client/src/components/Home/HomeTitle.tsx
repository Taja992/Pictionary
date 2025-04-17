


interface HomeTitleProps {
  title: string;
}

export default function HomeTitle({ title }: HomeTitleProps) {
  return <h1 className="home-title">{title}</h1>;
}