import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import TopBar from './ui/top-bar';
import { getTickers } from './lib/tickers';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const options = await getTickers();

  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <TopBar options={options} />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}