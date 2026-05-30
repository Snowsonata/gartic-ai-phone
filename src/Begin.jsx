import titleSrc from "./assets/title.svg";
import peopleSrc from "./assets/logo.png";
import selectSrc from "./assets/select.svg";
export default function Begin() {
  return (
    <div position="relative" style={{ height: "100%", width: "100%"}} >
      <img
        src={titleSrc}
        alt="title"
        style={{ position: "absolute", top: 0, left: "3%", zIndex: 1 }}
      />
      <img
        src={peopleSrc}
        alt="people"
        style={{ position: "absolute", right: 0, bottom: 0, width: "66%" }}
      />
      <div 
      onClick={() => window.location.href = "/App"}
      style={{ position: "absolute", bottom: "28%", left: "15%",cursor: 'pointer'}}>
        <img
          src={selectSrc}
          alt="select"
        />
      </div>
    </div>
  );
}
