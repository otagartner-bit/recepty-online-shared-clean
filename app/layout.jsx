export const metadata = {
  title: 'Recepty – sdílený katalog',
  description: 'Vkládej odkazy na recepty, ukládej a sdílej.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body style={{ fontFamily: 'system-ui, Segoe UI, Roboto, sans-serif', background: '#fafafa', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}
