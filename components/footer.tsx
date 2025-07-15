// components/footer.tsx
const Footer = () => (
  <footer className="w-full py-4 flex items-center justify-center text-sm text-muted-foreground">
    <span>
      &copy; 2019 - {new Date().getFullYear()} Aspire Educational Technologies LLC.
    </span>
  </footer>
);

export default Footer;
