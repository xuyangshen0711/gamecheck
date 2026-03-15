import './Header.css';

function Header() {
  return (
    <header className="header">
      <div>
        <p className="header__eyebrow">CS5610 Project 3</p>
        <h1>GameCheck</h1>
      </div>
      <p className="header__summary">
        Track your game library, log each session, and keep a reliable history of game nights.
      </p>
    </header>
  );
}

export default Header;
