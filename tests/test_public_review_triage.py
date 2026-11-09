import unittest
import sys
from tempfile import TemporaryDirectory
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.public_review_triage import triage, rows

def card(id, status="Needs review", parallel="", number="169", player="A.J. Brown",
         identity=True, set_name="2026 Topps - Base Set", image=""):
    return {
        "id":id,"sport":"Football","year":"2026","brand":"Topps",
        "set":set_name,"number":number,"player":player,"team":"Philadelphia Eagles",
        "parallel":parallel,"review_status":status,"identity_unconfirmed":identity,
        "image":image
    }

class PublicTriageSafetyTests(unittest.TestCase):
    def test_unreviewed_brown_base_and_canvas_never_combined(self):
        cards=[card("a"),card("b"),card("c",parallel="Canvas")]
        groups=triage(cards)
        self.assertEqual(len(groups),1)
        self.assertEqual(groups[0]["priority"],"P0_PARALLEL_CHECK")
        self.assertEqual(len(groups[0]["copies"]),2)
        self.assertEqual(groups[0]["needs_review"],2)
        self.assertEqual(groups[0]["variants_at_same_number"],["(unmarked)","Canvas"])

    def test_verified_pair_not_a_review_candidate(self):
        cards=[card("a","Verified",identity=False),
               card("b","Verified",identity=False)]
        self.assertEqual(triage(cards),[])

    def test_verified_anchor_review_priority(self):
        groups=triage([card("a","Verified",identity=False),
                       card("b","Needs review",identity=True)])
        self.assertEqual(groups[0]["priority"],"P1_VERIFIED_ANCHOR")
        self.assertEqual(groups[0]["verified_anchor"],1)

    def test_distinct_card_number_stays_distinct(self):
        self.assertEqual(triage([card("a",number="169"),
                                 card("b",number="170")]),[])

    def test_relic_uncertainty_high_risk(self):
        groups=triage([card("a",set_name="Base Memorabilia"),
                       card("b",set_name="Base Memorabilia")])
        self.assertEqual(groups[0]["priority"],"P3_HIGH_RISK")

    def test_missing_identity_fields_not_approved(self):
        a=card("a");b=card("b")
        a["number"]="";b["number"]=""
        self.assertEqual(triage([a,b]),[])

    def test_preview_hash_inside_public_snapshot_only(self):
        groups=triage([card("a",image="assets/a.jpg"),
                       card("b",image="../outside.txt")])
        with TemporaryDirectory() as d:
            root=Path(d)
            (root/"assets").mkdir()
            (root/"assets"/"a.jpg").write_bytes(b"approved-test-image")
            result=rows(groups,root)
            self.assertTrue(result[0]["front_present"])
            self.assertEqual(len(result[0]["approved_front_sha256"]),64)
            self.assertFalse(result[1]["front_present"])
            self.assertEqual(result[1]["approved_front_sha256"],"")

if __name__=="__main__":
    unittest.main()
