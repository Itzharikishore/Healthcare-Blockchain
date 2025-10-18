// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HealthcareRecords {
    
    struct Patient {
        string name;
        uint256 age;
        string bloodGroup;
        address walletAddress;
        bool exists;
    }
    
    struct Doctor {
        string name;
        string specialization;
        string licenseNumber;
        address walletAddress;
        bool exists;
        bool isApproved;
    }
    
    struct MedicalRecord {
        uint256 recordId;
        address patientAddress;
        string recordHash;
        string recordType;
        uint256 timestamp;
        address uploadedBy;
    }
    
    struct AccessRequest {
        uint256 requestId;
        address doctorAddress;
        address patientAddress;
        bool isApproved;
        uint256 timestamp;
        string purpose;
    }
    
    address public admin;
    uint256 public recordCount = 0;
    uint256 public requestCount = 0;
    
    mapping(address => Patient) public patients;
    mapping(address => Doctor) public doctors;
    mapping(uint256 => MedicalRecord) public medicalRecords;
    mapping(address => uint256[]) public patientRecords;
    mapping(uint256 => AccessRequest) public accessRequests;
    mapping(address => mapping(address => bool)) public accessPermissions;
    
    event PatientRegistered(address indexed patientAddress, string name);
    event DoctorRegistered(address indexed doctorAddress, string name);
    event DoctorApproved(address indexed doctorAddress);
    event RecordAdded(uint256 indexed recordId, address indexed patientAddress, address indexed doctor);
    event AccessRequested(uint256 indexed requestId, address indexed doctor, address indexed patient);
    event AccessGranted(address indexed doctor, address indexed patient);
    event AccessRevoked(address indexed doctor, address indexed patient);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyPatient() {
        require(patients[msg.sender].exists, "Only registered patients");
        _;
    }
    
    modifier onlyDoctor() {
        require(doctors[msg.sender].exists && doctors[msg.sender].isApproved, "Only approved doctors");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    function registerPatient(string memory _name, uint256 _age, string memory _bloodGroup) public {
        require(!patients[msg.sender].exists, "Patient already registered");
        
        patients[msg.sender] = Patient({
            name: _name,
            age: _age,
            bloodGroup: _bloodGroup,
            walletAddress: msg.sender,
            exists: true
        });
        
        emit PatientRegistered(msg.sender, _name);
    }
    
    function registerDoctor(string memory _name, string memory _specialization, string memory _licenseNumber) public {
        require(!doctors[msg.sender].exists, "Doctor already registered");
        
        doctors[msg.sender] = Doctor({
            name: _name,
            specialization: _specialization,
            licenseNumber: _licenseNumber,
            walletAddress: msg.sender,
            exists: true,
            isApproved: false
        });
        
        emit DoctorRegistered(msg.sender, _name);
    }
    
    function approveDoctor(address _doctorAddress) public onlyAdmin {
        require(doctors[_doctorAddress].exists, "Doctor not registered");
        doctors[_doctorAddress].isApproved = true;
        emit DoctorApproved(_doctorAddress);
    }
    
    function addMedicalRecord(address _patientAddress, string memory _recordHash, string memory _recordType) public onlyDoctor {
        require(patients[_patientAddress].exists, "Patient not registered");
        require(accessPermissions[_patientAddress][msg.sender], "No permission to add records");
        
        recordCount++;
        medicalRecords[recordCount] = MedicalRecord({
            recordId: recordCount,
            patientAddress: _patientAddress,
            recordHash: _recordHash,
            recordType: _recordType,
            timestamp: block.timestamp,
            uploadedBy: msg.sender
        });
        
        patientRecords[_patientAddress].push(recordCount);
        
        emit RecordAdded(recordCount, _patientAddress, msg.sender);
    }
    
    function requestAccess(address _patientAddress, string memory _purpose) public onlyDoctor {
        require(patients[_patientAddress].exists, "Patient not registered");
        
        requestCount++;
        accessRequests[requestCount] = AccessRequest({
            requestId: requestCount,
            doctorAddress: msg.sender,
            patientAddress: _patientAddress,
            isApproved: false,
            timestamp: block.timestamp,
            purpose: _purpose
        });
        
        emit AccessRequested(requestCount, msg.sender, _patientAddress);
    }
    
    function grantAccess(uint256 _requestId) public onlyPatient {
        AccessRequest storage request = accessRequests[_requestId];
        require(request.patientAddress == msg.sender, "Not your request");
        require(!request.isApproved, "Already approved");
        
        request.isApproved = true;
        accessPermissions[msg.sender][request.doctorAddress] = true;
        
        emit AccessGranted(request.doctorAddress, msg.sender);
    }
    
    function revokeAccess(address _doctorAddress) public onlyPatient {
        accessPermissions[msg.sender][_doctorAddress] = false;
        emit AccessRevoked(_doctorAddress, msg.sender);
    }
    
    function getPatientRecords(address _patientAddress) public view returns (uint256[] memory) {
        require(
            msg.sender == _patientAddress || 
            (doctors[msg.sender].exists && accessPermissions[_patientAddress][msg.sender]),
            "No permission to view records"
        );
        return patientRecords[_patientAddress];
    }
    
    function hasAccess(address _patientAddress, address _doctorAddress) public view returns (bool) {
        return accessPermissions[_patientAddress][_doctorAddress];
    }
    
    function getPatientInfo(address _patientAddress) public view returns (string memory name, uint256 age, string memory bloodGroup) {
        require(patients[_patientAddress].exists, "Patient not found");
        Patient memory patient = patients[_patientAddress];
        return (patient.name, patient.age, patient.bloodGroup);
    }
    
    function getDoctorInfo(address _doctorAddress) public view returns (string memory name, string memory specialization, bool isApproved) {
        require(doctors[_doctorAddress].exists, "Doctor not found");
        Doctor memory doctor = doctors[_doctorAddress];
        return (doctor.name, doctor.specialization, doctor.isApproved);
    }
}