// Helper to keep all unfinished controllers consistent during the phased build.
export function stub(name, phase) {
  return (req, res) => {
    res.status(501).json({
      success: false,
      message: `Not implemented yet: ${name} — lands in Phase ${phase}.`,
    });
  };
}
