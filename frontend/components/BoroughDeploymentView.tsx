import React from "react";

const BoroughDeploymentView = ({
    deployments,
}: {
    deployments: Record<string, number>;
}) => {
    return (
        <div
            style={{
                background: "rgba(50, 50, 50, 0.9)",
                padding: "20px",
                width: "100%",
                color: "#fff",
                borderRadius: "12px",
                marginTop: "20px",
                maxHeight: "100px",
                overflowY: "auto",
                scrollbarWidth: "none", // For Firefox
                msOverflowStyle: "none", // For Internet Explorer and Edge
                margin: "20px",
            }}
        >
            {Object.keys(deployments).map((borough) => (
                <div
                    key={borough}
                    style={{
                        margin: "5px 0",
                        background: "#444",
                        padding: "10px",
                        borderRadius: "5px",
                        color: "#fff",
                        minWidth: "150px",
                        textAlign: "left",
                    }}
                >
                    <strong>{borough}</strong>
                    <div>{deployments[borough]} Officers</div>
                </div>
            ))}
            <style jsx>{`
                div::-webkit-scrollbar {
                    display: none; // For Chrome, Safari, and Opera
                }
            `}</style>
        </div>
    );
};

export default BoroughDeploymentView;
