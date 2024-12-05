// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EventStorage {
    struct Event {
        address organizer;
        string eventType;
        string location;
        uint256 timeFrom;
        uint256 timeTo;
        uint256 date;
        string foodTypes;
        bool exists;
    }

    mapping(bytes32 => Event) public events;
    bytes32[] public eventIds;

    event EventCreated(bytes32 indexed eventId, string eventType, string location);
    event EventUpdated(bytes32 indexed eventId);

    function createEvent(
        string memory _eventType,
        string memory _location,
        uint256 _timeFrom,
        uint256 _timeTo,
        uint256 _date,
        string memory _foodTypes
    ) public returns (bytes32) {
        // Generate unique event ID
        bytes32 eventId = keccak256(abi.encodePacked(
            msg.sender, 
            _eventType, 
            _location, 
            _timeFrom, 
            _timeTo, 
            _date
        ));

        // Prevent duplicate events
        require(!events[eventId].exists, "Event already exists");

        // Store event
        events[eventId] = Event({
            organizer: msg.sender,
            eventType: _eventType,
            location: _location,
            timeFrom: _timeFrom,
            timeTo: _timeTo,
            date: _date,
            foodTypes: _foodTypes,
            exists: true
        });

        eventIds.push(eventId);

        emit EventCreated(eventId, _eventType, _location);
        return eventId;
    }

    function getEvent(bytes32 _eventId) public view returns (Event memory) {
        require(events[_eventId].exists, "Event does not exist");
        return events[_eventId];
    }

    function getAllEventIds() public view returns (bytes32[] memory) {
        return eventIds;
    }

    function updateEvent(
        bytes32 _eventId,
        string memory _eventType,
        string memory _location,
        uint256 _timeFrom,
        uint256 _timeTo,
        uint256 _date,
        string memory _foodTypes
    ) public {
        require(events[_eventId].exists, "Event does not exist");
        require(events[_eventId].organizer == msg.sender, "Only organizer can update");

        events[_eventId].eventType = _eventType;
        events[_eventId].location = _location;
        events[_eventId].timeFrom = _timeFrom;
        events[_eventId].timeTo = _timeTo;
        events[_eventId].date = _date;
        events[_eventId].foodTypes = _foodTypes;

        emit EventUpdated(_eventId);
    }
}