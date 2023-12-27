export default ({ scripts = [] }: { scripts: string[] }) => {
  return (
    <>
      {scripts.map((src: string) => (
        <link
          rel="preload"
          href={src}
          as="script"
          crossOrigin="anonymous"
          key={src}
        />
      ))}
    </>
  );
};
