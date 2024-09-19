import Navbar from "./components/Navbar";
import "./App.css";
import plusIcon from "./icons/Plus-Icon.svg";
import downloadIcon from "./icons/Download-Icon.svg";
import uploadIcon from "./icons/Upload-Icon.svg";
import { Toast, Button, Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import syncIcon from "./icons/Sync-Icon.svg";
import axios from "axios";
import * as XLSX from "xlsx";
import Alert from "react-bootstrap/Alert";
function App() {
  const DATABASE_URL = import.meta.env.VITE_DATABASE_URL; //Database url
  const [showToast, setShowToast] = useState(false); //state for toast(uploading box)
  const [sync, setSync] = useState(false);//state for useEffect dependency
  const [data, setData] = useState([]);//state to store data
  const [isAlert, setIsAlert] = useState({ variant: "primary", message: "Loading...",}); //State to manage alerts(default provided)
  const [options, setOptions] = useState({ "Classes": [], "Bus Ids": [], "Sections": [], "Admission Statuses": [], });//state to provide dynamic filters option
  const [filters , SetFilter] = useState({name:"",class:"",section:"",busId:"",admissionStatus:""}) //State to manage filters
  const [filteredData,setFilteredData] = useState([])

  const toggleSync = () => setSync(!sync); //Function to sync data by toggling it
  const closeToast = () => setShowToast(false); //function to close toast
  const openToast = () => { //function to open toast
    if (showToast) return;
    setShowToast(true);
  };
  //Function to handle alerts
  const handleAlert = (variant, message) => {
    setIsAlert({ variant, message });
    if (variant === "success" || variant === "dark") {
      setTimeout(() => {
        setIsAlert(null);
      }, 4000);
    }
  };
  //Handling the excel file and uploading the data to database(including data validation)
  const handleExcel = async (e) => {
    e.preventDefault(); //Preventing form default behavior(preventing reload)
    const reader = new FileReader(); //creating a new FileReader
    reader.readAsArrayBuffer(e.target[0].files[0]);
    reader.onload = async (e) => { //making the reader.onload an async to handle database update
      const temp = new Uint8Array(e.target.result);
      const binaryStr = String.fromCharCode.apply(null, temp); 
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parseData = XLSX.utils.sheet_to_json(sheet);
      const requiredFields = ["Id","Admission No","Name","Class","Section", "Bus Id","Current Status",]//Only these fields are required and valid in the excel file
      const existingAdmissionIds = new Set(
        data.map(([id, item]) => item["Admission No"])); //creating a new Set to handle duplicate data based on Addmission No
      const validData = parseData //filtering the parsed data after converting it from excel to json
        .filter((item) => {
          // checking  for missing required fields
          const missingFields = requiredFields.filter(
            (field) => !item.hasOwnProperty(field)
          );
          if (missingFields.length > 0) {
            alert(`File have Missing field(s) : ${missingFields.join(",")}`);
            throw new Error(
              `File have Missing field(s) : ${missingFields.join(",")}`
            );
          }

          // checking for duplicate Admission No
          if (existingAdmissionIds.has(item["Admission No"])) {
            return false; // skip if duplicate
          }

          
          return true; // returning true if valid
        })
        .map((item) => {
          // returning only required fields (filter out unwanted/garbage data)
          const filteredItem = {};
          requiredFields.forEach((field) => {
            filteredItem[field] = item[field];
          });
          return filteredItem;
        });

      if (validData.length === 0) {
        alert("No New/Unique data found, nothing to update");
        throw new Error("No New/Unique data found, nothing to update");
      }
      try {
        const promises = validData.map(async (data) => {
          const response = await axios.post(DATABASE_URL, data);
          return response.data;
        });
        await Promise.all(promises);
        setShowToast(false);
        alert("Data Uploaded to database, Click on 'Sync now' button");
      } catch (error) {
        alert("Failed to updated database, please try again");
        console.log(error);
      }
    };
  };
//fecthing data from database
  const fetchData = async () => {
    try {
      let response = await axios.get(DATABASE_URL);

      if (response.data === null) {
        handleAlert(
          "warning",
          "No data preesent in database. \n Upload one excel file and click Sync now button"
        );
        return;
      } else {
        setData([...Object.entries(response.data)]);
        handleAlert("success", "Data synced from batabase");
      }
    } catch (error) {
      handleAlert(
        "danger",
        "Failed to get data from server, please try again!!"
      );
      console.log("at catch block", error);
    }
  };
//useEffect to sync data from database
  useEffect(() => {
    fetchData();
    handleAlert("primary", "Syncing...");
  }, [sync]);
//useEffect for dynamic options in filter section
  useEffect(() => {
    let classes = Array.from(
      new Set(data.map(([id, element]) => element["Class"]))
    );
    let busIds = Array.from(
      new Set(data.map(([id, element]) => element["Bus Id"]))
    );
    let sections = Array.from(
      new Set(data.map(([id, element]) => element["Section"]))
    );
    let addmissionStatuses = Array.from(
      new Set(data.map(([id, element]) => element["Current Status"]))
    );
    setOptions({
      Classes: [...classes],
      "Bus Ids": [...busIds],
      Sections: [...sections],
      "Admission Statuses": [...addmissionStatuses],
    });
  }, [data]);

  //useEffect for handling filters
  useEffect(()=>{
    if (!filters.name && !filters.class && !filters.section && !filters.busId && !filters.admissionStatus) {
      setFilteredData([...data])
      return
    }
    const timeoutId = setTimeout(() => {
      const results = data.filter(([id,item]) => {
        return (
          item['Name'].toLowerCase().includes(filters.name.toLowerCase()) &&
          (filters.class ? item['Class'] === +filters.class : true) &&
          (filters.section ? item['Section'] === filters.section : true) &&
          (filters.busId ? item['Bus Id'] === filters.busId : true) &&
          (filters.admissionStatus ? item['Current Status'] === filters.admissionStatus : true)
        )
      })
      setFilteredData(results);
    }, 300); // debounce

    return () => clearTimeout(timeoutId);
  },[data,filters])
  return (
    <>
      <Navbar />
      <main>
        <section  id="filter-section"
          className="border py-2 row justify-content-center gap-4 text-nowrap lh-sm w-100 m-auto"
        >
          <div className="col-8 col-sm-4 col-md-3 col-lg-3 col-xl-2">
            <p className="label">Student Name / Admission No</p>
            <input type="text" placeholder="Search by name" onChange={(e)=>SetFilter((prev)=>({...prev,name:e.target.value}))}/>
          </div>
          <div className="col-8 col-sm-4 col-md-3 col-lg-3 col-xl-2">
            <p className="label">Class</p>
            <select className="custom-select" onChange={(e)=>SetFilter((prev)=>({...prev,class:e.target.value}))}>
              <option value="">Select class</option>
              {options["Classes"]?.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div className="col-8 col-sm-4 col-md-3 col-lg-3 col-xl-2">
            <p className="label" >Section</p>
            <select  className="custom-select" onChange={(e)=>SetFilter((prev)=>({...prev,section:e.target.value}))}>
              <option value="">Select section</option>
              {options["Sections"]?.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div className="col-8 col-sm-4 col-md-3 col-lg-3 col-xl-2">
            <p className="label">Bus ID</p>
            <select  className="custom-select" onChange={(e)=>SetFilter((prev)=>({...prev,busId:e.target.value}))}>
              <option value="">Select Bus Id</option>
              {options["Bus Ids"]?.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div className="col-8 col-sm-4 col-md-3 col-lg-3 col-xl-2">
            <p className="label">Admission status</p>
            <select  className="custom-select" onChange={(e)=>SetFilter((prev)=>({...prev,admissionStatus:e.target.value}))}>
              <option value="">Select Admission status</option>
              {options["Admission Statuses"]?.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section  id="upload-section"
          className="row bg-dark border justify-content-evenly gap-2 py-2 px-3 w-100 m-auto"
        >
          <div
            onClick={() =>
              handleAlert(
                "dark",
                "Option to live yet, try uploading a excel file for now"
              )
            }
            className=" bg-transparent text-white  col-10 col-sm-3 align-items-center py-1  d-flex border border-warning   justify-content-between"
          >
            <>Add Student using Form</>
            <img src={plusIcon} alt="plusIcon" className="icons" />
          </div>
          <div
            onClick={() => handleAlert("dark", "Option to live yet")}
            className=" bg-transparent text-white  col-10 col-sm-3 align-items-center py-1  d-flex border border-warning   justify-content-between"
          >
            <>Download QR Code</>
            <img src={downloadIcon} alt="uploadIcon" className="icons" />
          </div>
          <div
            onClick={openToast}
            className=" bg-transparent text-white  col-10 col-sm-3 align-items-center py-1  d-flex border border-warning   justify-content-between"
          >
            <>Upload Excel File</>
            <img src={uploadIcon} alt="downloadIcon" className="icons" />
            <Toast
              onClose={closeToast}
              show={showToast}
              style={{
                maxWidthidth: "250px",
                marginLeft: "-3.35rem",
              }}
              className=" position-absolute z-2"
            >
              <Toast.Header>
                <strong className="me-auto">File Upload</strong>
              </Toast.Header>
              <Toast.Body>
                <Form onSubmit={handleExcel}>
                  <Form.Group controlId="formFile">
                    <Form.Label>Select a file to upload</Form.Label>
                    <Form.Control type="file" accept=".xlsx, .xls"  required />
                  </Form.Group>
                  <Button
                    type="submit"
                    variant="primary"
                    // disabled={!selectedFile}
                    className=" mt-2"
                  >
                    Verify & Upload
                  </Button>
                </Form>
              </Toast.Body>
            </Toast>
          </div>
        </section>
        {isAlert && (
          <Alert variant={isAlert.variant} className=" text-center fw-bold">
            {isAlert.message}
          </Alert>
        )}
        <section id="table-section" className="table-responsive">
          <div className="d-flex border align-items-center p-2 px-5  justify-content-between w-100">
            <h6>Student Data</h6>
            <Button
              variant="warning"
              className="text-white d-flex align-items-center gap-2"
              onClick={toggleSync}
            >
              Sync now
              <img src={syncIcon} alt="sync-icon" className="icons" />
            </Button>
          </div>
          <table className=" table table-striped ">
            <thead>
              <tr className="text-center">
                <th>Id</th>
                <th>Admission No</th>
                <th>Name</th>
                <th>Class</th>
                <th>Section</th>
                <th>Bus Id</th>
                <th>Current Status</th>
                <th>View QR Code</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(([id, element], index) => (
                <tr key={index} className=" text-center">
                  <td>{element["Id"]}</td>
                  <td>{element["Admission No"]}</td>
                  <td>{element["Name"]}</td>
                  <td>{element["Class"]}</td>
                  <td>{element["Section"]}</td>
                  <td>{element["Bus Id"]}</td>
                  <td>{element["Current Status"]}</td>
                  <td>
                    <QRCode value={`${element["Admission No"]}`} size={50} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </>
  );
}

export default App;
