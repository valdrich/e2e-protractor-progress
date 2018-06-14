DEF NEW GLOBAL SHARED VAR oSessionParams AS CLASS com.totvs.framework.utp.SessionParams NO-UNDO.

DEF VAR mHeader AS MEMPTR NO-UNDO.
DEF VAR mData AS MEMPTR NO-UNDO.
DEF VAR hServer AS HANDLE NO-UNDO.
DEF VAR lRC AS LOGICAL NO-UNDO.
DEF VAR wWin AS WIDGET-HANDLE.
DEF VAR cMessage AS CHAR FORMAT "x(43)" NO-UNDO.
DEF VAR cSocket AS CHAR NO-UNDO.
DEF VAR pSocketId AS CHAR NO-UNDO.

DEF FRAME fMessage
    cMessage AT ROW 1 COL 1 NO-LABEL
    WITH SIZE 45 BY 1.1 SIDE-LABELS BGCOLOR 14.

ASSIGN pSocketId = oSessionParams:getMapValue("testAgentPort").
IF pSocketId = "" THEN
    RETURN.

CREATE WINDOW wWin ASSIGN
    WIDTH-CHARS = 45
    HEIGHT-CHARS = 1.1
    STATUS-AREA = NO
    MESSAGE-AREA = NO
    TITLE = "DATASUL Test Agent"
    VISIBLE = YES.

ASSIGN THIS-PROCEDURE:CURRENT-WINDOW = wWin.

ASSIGN wWin:TITLE = wWin:TITLE + " (" + pSocketId + ")". 

ON 'WINDOW-CLOSE':U OF wWin DO:
    APPLY "CLOSE" TO THIS-PROCEDURE.
    DELETE WIDGET wWin.
END.

ON 'CLOSE':U OF THIS-PROCEDURE DO:
    hServer:DISABLE-CONNECTIONS().
    DELETE OBJECT hServer.
    SET-SIZE(mHeader) = 0.
    SET-SIZE(mData)   = 0.
END.

DISPLAY cMessage WITH FRAME fMessage.

SET-SIZE(mHeader) = 0.
SET-SIZE(mHeader) = 2.

CREATE SERVER-SOCKET hServer.

ASSIGN cSocket = "-S " + pSocketId.

lRC = hServer:ENABLE-CONNECTIONS(cSocket) NO-ERROR.
IF lRC = FALSE OR ERROR-STATUS:GET-MESSAGE(1) <> '' THEN DO:
    ASSIGN cMessage:SCREEN-VALUE IN FRAME fMessage = 'Unable To Establish Listener'.
    RETURN.
END.

lRC = hServer:SET-CONNECT-PROCEDURE('ProcessClientConnect') NO-ERROR.
IF lRC = FALSE OR ERROR-STATUS:GET-MESSAGE(1) <> '' THEN DO:
    ASSIGN cMessage:SCREEN-VALUE IN FRAME fMessage = 'Unable To Establish Connect Procedure'.
    RETURN.
END.

ASSIGN cMessage:SCREEN-VALUE IN FRAME fMessage = 'Waiting for Test Scripts...'.

PROCEDURE ProcessClientConnect:
    DEFINE INPUT PARAMETER hSocket AS HANDLE NO-UNDO.
    lRC = hSocket:SET-READ-RESPONSE-PROCEDURE('SocketIO') NO-ERROR.
    IF lRC = FALSE OR ERROR-STATUS:GET-MESSAGE(1) <> '' THEN
        DO:
            ASSIGN cMessage:SCREEN-VALUE IN FRAME fMessage = 'Unable To Establish Read Response Procedure'.
            RETURN.
        END.
    ASSIGN cMessage:SCREEN-VALUE IN FRAME fMessage = 'Client Connected'.
END PROCEDURE.

PROCEDURE SocketIO:
    DEFINE VARIABLE cTime          AS CHARACTER NO-UNDO.
    DEFINE VARIABLE iMessageSize   AS INTEGER   NO-UNDO.
    DEFINE VARIABLE cData          AS CHARACTER NO-UNDO.
    DEFINE VARIABLE cCommand       AS CHARACTER NO-UNDO.
    DEFINE VARIABLE iPipe          AS INTEGER   NO-UNDO.
    DEFINE VARIABLE cReturnMessage AS CHARACTER NO-UNDO.
    
    IF SELF:CONNECTED() = FALSE THEN DO:
        ASSIGN cMessage:SCREEN-VALUE IN FRAME fMessage = 'Waiting for Test Scripts...'.
        RETURN.
    END.

    assign iMessageSize = self:GET-BYTES-AVAILABLE().
    
    SET-SIZE(mData)       = 0.
    SET-SIZE(mData)       = iMessageSize.

    lRC = SELF:READ(mData,1,iMessageSize,2) NO-ERROR.
    IF lRC = FALSE OR ERROR-STATUS:GET-MESSAGE(1) <> '' THEN
        DO:
            ASSIGN cMessage:SCREEN-VALUE IN FRAME fMessage = 'Unable To Read Detail Bytes'.
            RETURN.
        END.

    ASSIGN cData = GET-STRING(mData, 1)
           cData = CODEPAGE-CONVERT(cData, "ISO8859-1", "UTF-8")
           iPipe = INDEX(cData,"|").
    ASSIGN cMessage:SCREEN-VALUE IN FRAME fMessage = cData.
    IF iPipe > 0 THEN
        ASSIGN cCommand = SUBSTRING(cData,1,iPipe - 1)
               cData = SUBSTRING(cData,iPipe + 1).
    ELSE
        ASSIGN cCommand = cData
               cData = "".
    
    RUN VALUE("pi-" + cCommand) (INPUT cData).
    IF SELF:CONNECTED() THEN DO:
        cReturnMessage = RETURN-VALUE.
        cReturnMessage = CODEPAGE-CONVERT(cReturnMessage, "UTF-8", "ISO8859-1").
        ASSIGN iMessageSize = LENGTH(cReturnMessage).
        SET-SIZE(mData) = 0.
        SET-SIZE(mData) = 2 + iMessageSize.
        PUT-UNSIGNED-SHORT(mData,1) = iMessageSize.
        IF iMessageSize > 0 THEN
            PUT-STRING(mData,3,iMessageSize) = cReturnMessage.
        IF SELF:CONNECTED() THEN DO:
            lRC = SELF:WRITE(mData,1,2 + iMessageSize).
        END.
    END.

END PROCEDURE.

PROCEDURE pi-findElement:
    DEF INPUT PARAM pMessage AS CHAR NO-UNDO.

    DEF VAR hElement AS WIDGET-HANDLE NO-UNDO.
    DEF VAR hParent AS WIDGET-HANDLE NO-UNDO.

    IF ENTRY(2,pMessage,"|") = "undefined" THEN
        RUN pi-findElementNoParent (INPUT ENTRY(1,pMessage,"|"), OUTPUT hElement).
    ELSE DO:
        IF ENTRY(2,pMessage,"|") <> "?" THEN DO:
            ASSIGN hParent = WIDGET-HANDLE(ENTRY(2,pMessage,"|")).
            RUN pi-findElementLoop (INPUT hParent, INPUT ENTRY(1,pMessage,"|"), OUTPUT hElement).
        END.
    END.

    IF hElement <> ? THEN
        RETURN STRING(hElement).
    ELSE
        RETURN "?".

END.

PROCEDURE pi-findElementNoParent:

    DEF INPUT PARAM pMessage AS CHAR NO-UNDO.
    DEF OUTPUT PARAM pElement AS WIDGET-HANDLE NO-UNDO.

    DEF VAR hWindow AS WIDGET-HANDLE NO-UNDO.

    ASSIGN hWindow = SESSION:FIRST-CHILD.

    DO WHILE hWindow <> ?:
        RUN pi-findElementLoop (INPUT hWindow, INPUT pMessage, OUTPUT pElement).
        IF pElement <> ? THEN
            RETURN.
        ASSIGN hWindow = hWindow:NEXT-SIBLING.
    END.

    RETURN ?.

END.

PROCEDURE pi-findElementLoop:

    DEF INPUT PARAM pWidget AS WIDGET-HANDLE NO-UNDO.
    DEF INPUT PARAM pName AS CHAR NO-UNDO.
    DEF OUTPUT PARAM pElement AS WIDGET-HANDLE NO-UNDO.

    DEF VAR hChild AS WIDGET-HANDLE NO-UNDO.

    IF pWidget:NAME = pName 
    AND pWidget:VISIBLE = YES THEN DO:

        ASSIGN pElement = pWidget.
        RETURN.
    END.

    IF LOOKUP(pWidget:TYPE, "WINDOW,FRAME,FIELD-GROUP,DIALOG-BOX") > 0 THEN DO:
        ASSIGN hChild = pWidget:FIRST-CHILD.
        DO WHILE hChild <> ?:
            RUN pi-findElementLoop (INPUT hChild, INPUT pName, OUTPUT pElement).
            IF pElement <> ? THEN
                RETURN.
            ASSIGN hChild = hChild:NEXT-SIBLING.
        END.
    END.

    RETURN ?.

END.

PROCEDURE pi-findElementByAttribute:
    DEF INPUT PARAM pMessage AS CHAR NO-UNDO.

    DEF VAR hParent AS WIDGET-HANDLE NO-UNDO.
	DEFINE VAR psearch  AS CHARACTER   NO-UNDO.
    DEFINE VAR pvalue   AS CHARACTER   NO-UNDO.
    
	DEFINE VARIABLE hElement AS HANDLE NO-UNDO.
	
	ASSIGN psearch = ENTRY(1, pMessage, "|")
	       pvalue = ENTRY(2, pMessage, "|")
		   hParent = WIDGET-HANDLE(ENTRY(3,pMessage,"|")).
		   
	//MESSAGE pMessage skip hParent skip valid-handle(hParent) view-as alert-box.
	       
	RUN pi-findElementByAttributeRec(hParent, psearch, pvalue, OUTPUT hElement).

	IF hElement <> ? THEN
        RETURN STRING(hElement).
    ELSE
        RETURN "?".
		
END PROCEDURE.

PROCEDURE pi-findElementByAttributeRec private:
    DEFINE INPUT  PARAMETER phandle  AS HANDLE      NO-UNDO.
    DEFINE INPUT  PARAMETER psearch  AS CHARACTER   NO-UNDO.
    DEFINE INPUT  PARAMETER pvalue   AS CHARACTER   NO-UNDO.
    DEFINE OUTPUT PARAMETER hElement AS HANDLE      NO-UNDO.

    DEFINE VARIABLE cValue AS CHARACTER   NO-UNDO.
    DEFINE VARIABLE h AS HANDLE      NO-UNDO.
    DEFINE VARIABLE hcall AS HANDLE      NO-UNDO.    
    
    h = phandle:FIRST-CHILD.
    
    DO WHILE VALID-HANDLE(h):
        CREATE CALL hCall.
        hcall:IN-HANDLE = h.
        hcall:CALL-TYPE = GET-ATTR-CALL-TYPE.
        hcall:CALL-NAME = psearch.
        hcall:INVOKE() NO-ERROR.
        cValue = hcall:RETURN-VALUE.
        DELETE OBJECT hCall.

        IF CAN-QUERY(h, psearch) and
            cValue <> ? and
            cvalue = pvalue THEN
        DO:
            helement = h.
            LEAVE.
        END.

        IF CAN-QUERY(h, "first-child") THEN
            RUN pi-findElementByAttributeRec(INPUT h, 
			                                 INPUT psearch,
                                             INPUT pvalue, 
						                     OUTPUT helement).
 
        IF VALID-HANDLE(helement) THEN LEAVE.

        ASSIGN h = h:NEXT-SIBLING.
        
    END.
    
END PROCEDURE.

PROCEDURE pi-findWindow:
    DEF INPUT PARAM pMessage AS CHAR NO-UNDO.

    DEF VAR hWindow AS WIDGET-HANDLE NO-UNDO.
    DEF VAR hChild AS WIDGET-HANDLE NO-UNDO.

    ASSIGN hWindow = SESSION:FIRST-CHILD.

    LOOP:
    DO WHILE hWindow <> ?:
        IF INDEX(hWindow:TITLE, pMessage) > 0 THEN
            LEAVE.
        ASSIGN hChild = hWindow:FIRST-CHILD.
        DO WHILE hChild <> ?:
            IF hChild:TYPE = "DIALOG-BOX" AND INDEX(hChild:TITLE, pMessage) > 0 THEN DO:
                ASSIGN hWindow = hChild.
                LEAVE LOOP.
            END.
            ASSIGN hChild = hChild:NEXT-SIBLING.
        END.
        ASSIGN hWindow = hWindow:NEXT-SIBLING.
    END.

    IF hWindow <> ? THEN
        RETURN STRING(hWindow).
    ELSE
        RETURN "?".

END.

PROCEDURE pi-apply:

    DEF INPUT PARAM pMessage AS CHAR NO-UNDO.

    DEF VAR hElement AS WIDGET-HANDLE NO-UNDO.
    DEF VAR iReturn AS INTEGER NO-UNDO.

    IF ENTRY(1,pMessage,"|") <> "?" THEN DO:
        ASSIGN hElement = WIDGET-HANDLE(ENTRY(1,pMessage,"|")).
        IF VALID-HANDLE(hElement) THEN DO:
            IF CAPS(ENTRY(2,pMessage,"|")) = "CHOOSE" THEN DO:
                Run PostMessageA (  Input hElement:Hwnd,
                                    Input 513,
                                    Input 1,
                                    Input 0,
                                    OUTPUT iReturn).
                Run PostMessageA (  Input hElement:Hwnd,
                                    Input 514,
                                    Input 1,
                                    Input 0,
                                    OUTPUT iReturn).
            END.
            ELSE
                APPLY ENTRY(2,pMessage,"|") TO hElement.
            IF ENTRY(3,pMessage,"|") = "undefined" OR ENTRY(3,pMessage,"|") = "false" THEN
                RETURN "OK".
            ELSE
                RETURN "".
        END.
        ELSE
            RETURN "NOK".
    END.
    ELSE
    RETURN "NOK".

END.

PROCEDURE pi-run:

    DEF INPUT PARAM pMessage AS CHAR NO-UNDO.

    IF SEARCH(pMessage) <> ? THEN DO:
        RUN VALUE(pMessage) PERSISTENT.
        RETURN "OK".
    END.
    RETURN "NOK".

END.

PROCEDURE pi-sendKeys:

    DEF INPUT PARAM pMessage AS CHAR NO-UNDO.

    DEF VAR hElement AS WIDGET-HANDLE NO-UNDO.
    DEF VAR cKeys AS CHAR NO-UNDO.
    DEF VAR iInd AS INTEGER NO-UNDO.
    DEF VAR lEmpty AS LOGICAL NO-UNDO.

    IF ENTRY(1,pMessage,"|") <> "?" THEN DO:
        ASSIGN hElement = WIDGET-HANDLE(ENTRY(1,pMessage,"|"))
               cKeys = ENTRY(2,pMessage,"|").
        IF VALID-HANDLE(hElement) THEN DO:
            ASSIGN lEmpty = LENGTH(hElement:SCREEN-VALUE) = 0.
            IF hElement:BLANK = YES THEN DO:
                DO iInd = LENGTH(cKeys) TO 1 by -1:
                    APPLY SUBSTRING(cKeys,iInd,1) TO hElement.
                END.
            END.
            ELSE DO:
                DO iInd = 1 TO LENGTH(cKeys):
                    APPLY SUBSTRING(cKeys,iInd,1) TO hElement.
                END.
            END.
            IF lEmpty THEN
                hElement:SCREEN-VALUE = TRIM(hElement:SCREEN-VALUE).
            RETURN "OK".
        END.
    END.
    RETURN "NOK".

END.

PROCEDURE pi-get:

    DEF INPUT PARAM pMessage AS CHAR NO-UNDO.

    DEF VARIABLE hElement AS WIDGET-HANDLE NO-UNDO.
    DEF VARIABLE hCall AS HANDLE NO-UNDO.
    DEF VARIABLE cRet AS CHARACTER NO-UNDO.

    IF ENTRY(1,pMessage,"|") <> "?" THEN DO:
        ASSIGN hElement = WIDGET-HANDLE(ENTRY(1,pMessage,"|")).
        IF VALID-HANDLE(hElement) AND NUM-ENTRIES(pMessage,"|") = 2 THEN DO:
            CREATE CALL hCall.
            hCall:IN-HANDLE = hElement.
            hCall:CALL-TYPE = GET-ATTR-CALL-TYPE.
            hCall:CALL-NAME = ENTRY(2,pMessage,"|").
            hCall:INVOKE NO-ERROR.
            cRet = STRING(hCall:RETURN-VALUE).
            hCall:CLEAR.
            DELETE OBJECT hCall.
            RETURN cRet.
        END.
    END.

    RETURN "?".

END.

PROCEDURE pi-set:

    DEF INPUT PARAM pMessage AS CHAR NO-UNDO.

    DEF VARIABLE hElement AS WIDGET-HANDLE NO-UNDO.
    DEF VARIABLE hCall AS HANDLE NO-UNDO.

    IF ENTRY(1,pMessage,"|") <> "?" THEN DO:
        ASSIGN hElement = WIDGET-HANDLE(ENTRY(1,pMessage,"|")).
        IF VALID-HANDLE(hElement) AND NUM-ENTRIES(pMessage,"|") = 3 THEN DO:
            CREATE CALL hCall.
            hCall:IN-HANDLE = hElement.
            hCall:CALL-TYPE = SET-ATTR-CALL-TYPE.
            hCall:CALL-NAME = ENTRY(2,pMessage,"|").
            hCall:NUM-PARAMETERS = 1.
            hCall:SET-PARAMETER(1,"CHARACTER","INPUT",ENTRY(3,pMessage,"|")).
            hCall:INVOKE NO-ERROR.
            hCall:CLEAR.
            DELETE OBJECT hCall.
            RETURN "OK".
        END.
    END.

    RETURN "NOK".

END.

PROCEDURE pi-query:

    DEF INPUT PARAM pMessage AS CHAR NO-UNDO.

    DEFINE VARIABLE hQuery  AS WIDGET-HANDLE NO-UNDO.    
    DEFINE VARIABLE hBuffer AS WIDGET-HANDLE NO-UNDO.
    
    CREATE BUFFER hBuffer FOR TABLE ENTRY(1,pMessage,"|").
        
    CREATE QUERY hQuery.
    hQuery:SET-BUFFERS(hBuffer).
    hQuery:QUERY-PREPARE("FOR EACH " + ENTRY(1,pMessage,"|") + " NO-LOCK WHERE " + ENTRY(2,pMessage,"|")).
    hQuery:QUERY-OPEN().
    hQuery:GET-FIRST().

    IF hBuffer:AVAILABLE THEN
        RETURN STRING(hBuffer:BUFFER-FIELD(ENTRY(3,pMessage,"|")):BUFFER-VALUE).
    ELSE 
        RETURN "?".
END.

PROCEDURE PostMessageA EXTERNAL "user32.dll":
    DEFINE INPUT PARAMETER hwnd   AS LONG.
    DEFINE INPUT PARAMETER umsg   AS LONG.
    DEFINE INPUT PARAMETER wparam AS LONG.
    DEFINE INPUT PARAMETER lparam AS LONG.
    DEFINE RETURN PARAMETER lReturn AS LONG.
END.

PROCEDURE pi-selectRow:

    DEF INPUT PARAM pMessage AS CHAR NO-UNDO.

    DEF VAR hElement AS WIDGET-HANDLE NO-UNDO.
    DEF VAR iRow AS INTEGER NO-UNDO.

    IF ENTRY(1,pMessage,"|") <> "?" THEN DO:
        ASSIGN hElement = WIDGET-HANDLE(ENTRY(1,pMessage,"|"))
               iRow = INTEGER(ENTRY(2,pMessage,"|")).
        IF VALID-HANDLE(hElement) THEN DO:
            hElement:SELECT-ROW(iRow).
            RETURN "OK".
        END.
    END.
    RETURN "NOK".

END.
